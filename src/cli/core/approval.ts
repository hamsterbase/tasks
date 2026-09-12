import { z } from 'zod';
import { CliExplanation, CliExplanationImage } from '../../base/common/cliApproval/explanation';
import { nanoid } from 'nanoid';
import * as fs from 'fs/promises';
import * as net from 'net';
import * as path from 'path';
import {
  checkPlacement,
  PlacementErrorCode,
  PlacementMode,
  PlacementSubject,
} from '../../base/common/cliApproval/placement';
import { stripItemIdPrefix } from '../../base/common/itemId';
import {
  CliChangeOp,
  CliChangeRequest,
  CliCreateHeading,
  CliCreateItem,
  CliCreateProject,
  CliCreateTask,
  CliItemPosition,
  CliInstanceInfo,
  CliSocketResponse,
  instanceProtocolVersion,
  NdjsonDecoder,
  OLDEST_PROTOCOL_VERSION,
  serializeMessage,
} from '../../base/common/cliApproval/protocol';
import { TaskModel } from '../../core/model';
import { ITaskModelData, TaskObjectSchema } from '../../core/type';
import { loadModel } from './loadModel';
import { getDataDirs } from './paths';

/**
 * Discover running desktop instances by reading the discovery files the
 * Electron main process writes to `<dataDir>/ipc/<instanceId>.json`. Files
 * whose process is dead are ignored (crashes leave them behind).
 */
interface DiscoveredInstance {
  info: CliInstanceInfo;
  /** data root containing the discovery file and this instance's databases */
  dataDir: string;
}

async function discoverInstances(dataDirs: string[]): Promise<DiscoveredInstance[]> {
  const seen = new Map<string, DiscoveredInstance>();
  for (const dataDir of dataDirs) {
    const ipcDir = path.join(dataDir, 'ipc');
    let entries: string[];
    try {
      entries = await fs.readdir(ipcDir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue;
      try {
        const info = JSON.parse(await fs.readFile(path.join(ipcDir, entry), 'utf8')) as CliInstanceInfo;
        if (!info.instanceId || !info.socketPath || !info.pid) continue;
        process.kill(info.pid, 0);
        seen.set(info.instanceId, { info, dataDir });
      } catch {
        // unreadable or dead instance — skip
      }
    }
  }
  return [...seen.values()].sort((a, b) => a.info.startedAt - b.info.startedAt);
}

export async function listInstances(): Promise<CliInstanceInfo[]> {
  return (await discoverInstances(getDataDirs())).map(({ info }) => info);
}

/**
 * Refuse a command the selected app is too old to understand. A newer app
 * always speaks to an older CLI, so this only guards the other direction, and
 * only when the command or a supplied option requires a version above the oldest one.
 */
export async function assertInstanceSupports(
  minProtocolVersion: number,
  instanceFlag?: string,
  dataDirs: string[] = getDataDirs()
): Promise<void> {
  if (minProtocolVersion <= OLDEST_PROTOCOL_VERSION) return;

  const discovered = await discoverInstances(dataDirs);
  const instance = resolveInstance(
    discovered.map(({ info }) => info),
    instanceFlag
  );
  const supported = instanceProtocolVersion(instance);
  if (supported >= minProtocolVersion) return;

  const app = instance.appVersion ? ` (app ${instance.appVersion})` : '';
  throw new Error(
    [
      'the desktop app is too old for this command',
      `  instance ${instance.instanceId}${app} speaks protocol v${supported}, this command needs v${minProtocolVersion}`,
      '  update HamsterBase Tasks and try again',
    ].join('\n')
  );
}

export function resolveInstance(instances: CliInstanceInfo[], instanceFlag?: string): CliInstanceInfo {
  if (instances.length === 0) {
    throw new Error('no running desktop instance found\nstart the Hamsterbase Tasks desktop app and try again');
  }
  if (instanceFlag) {
    const match = instances.find((i) => i.instanceId === instanceFlag);
    if (!match) {
      throw new Error(
        [`instance "${instanceFlag}" not found`, ...instances.map((i) => `  ${i.instanceId} (pid ${i.pid})`)].join('\n')
      );
    }
    return match;
  }
  if (instances.length > 1) {
    throw new Error(
      [
        'multiple desktop instances are running; pass --instance <id>:',
        ...instances.map((i) => `  ${i.instanceId} (pid ${i.pid}, database ${i.databaseId || 'unknown'})`),
      ].join('\n')
    );
  }
  return instances[0];
}

export interface InstanceContext {
  instance: CliInstanceInfo;
  databaseId: string;
  model: TaskModel;
}

/** Resolve an app instance and load the snapshot of the database it has open. */
export async function loadInstanceContext(
  instanceFlag?: string,
  dataDirs: string[] = getDataDirs()
): Promise<InstanceContext> {
  const discovered = await discoverInstances(dataDirs);
  const instance = resolveInstance(
    discovered.map(({ info }) => info),
    instanceFlag
  );
  const selected = discovered.find(({ info }) => info === instance);
  if (!selected) {
    throw new Error(`instance "${instance.instanceId}" discovery source was lost`);
  }
  if (!instance.databaseId) {
    throw new Error(`instance "${instance.instanceId}" has not reported an open database yet`);
  }
  return {
    instance,
    databaseId: instance.databaseId,
    model: await loadModel(instance.databaseId, selected.dataDir),
  };
}

/** Send one change request over the instance socket and wait for the ack. */
export function submitToInstance(instance: CliInstanceInfo, request: CliChangeRequest): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const socket = net.createConnection(instance.socketPath);
    const decoder = new NdjsonDecoder();
    const messageId = nanoid(8);
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('timed out waiting for the desktop app'));
    }, 5000);
    const finish = (error?: Error) => {
      clearTimeout(timeout);
      socket.end();
      if (error) reject(error);
      else resolve();
    };
    socket.setEncoding('utf8');
    socket.on('connect', () => {
      socket.write(serializeMessage({ id: messageId, type: 'submit', request }));
    });
    socket.on('data', (chunk: string) => {
      for (const message of decoder.append(chunk)) {
        const response = message.value as CliSocketResponse | undefined;
        if (!response) continue;
        if (response.ok) finish();
        else finish(new Error(response.error));
        return;
      }
    });
    socket.on('error', () => {
      finish(new Error('could not connect to the desktop instance\nis the desktop app still running?'));
    });
  });
}

export interface SubmitResult {
  requestId: string;
  instanceId: string;
  databaseId: string;
  summary: string[];
}

export interface SubmitContext {
  explanation?: CliExplanation;
  instanceFlag?: string;
  /** builds and validates ops against the current model snapshot */
  buildOps: (data: ITaskModelData) => { ops: CliChangeOp[]; summary: string[] };
}

/**
 * Shared flow of every write command: resolve the app instance → load and
 * validate against that app's database snapshot → submit for approval. Fire and
 * forget: a resolved promise only means the request is queued in the desktop
 * app, the user still has to approve it there.
 */
export async function submitChangeRequest(context: SubmitContext): Promise<SubmitResult> {
  const { instance, databaseId, model } = await loadInstanceContext(context.instanceFlag);
  const { ops, summary } = context.buildOps(model.toJSON());

  const request: CliChangeRequest = {
    ...(context.explanation ? { explanation: context.explanation } : {}),
    requestId: nanoid(),
    databaseId,
    createdAt: Date.now(),
    source: 'cli',
    ops,
  };
  await submitToInstance(instance, request);
  return { requestId: request.requestId, instanceId: instance.instanceId, databaseId, summary };
}

// --- model lookup helpers shared by the write commands ---

export function requireTask(data: ITaskModelData, uid: string): TaskObjectSchema {
  const item = data.taskObjectUidMap.get(uid);
  if (!item) {
    throw new Error(`task "${uid}" not found`);
  }
  if (item.type !== 'task') {
    throw new Error(`"${uid}" is a ${item.type}, not a task`);
  }
  return item;
}

export function requireContainer(data: ITaskModelData, uid: string): TaskObjectSchema {
  const item = data.taskObjectUidMap.get(uid);
  if (!item) {
    throw new Error(`parent "${uid}" not found`);
  }
  if (item.type !== 'project' && item.type !== 'area' && item.type !== 'projectHeading') {
    throw new Error(`parent "${uid}" is a ${item.type}; it must be a project, area or heading`);
  }
  return item;
}

export function requireArea(data: ITaskModelData, uid: string): TaskObjectSchema {
  const item = data.taskObjectUidMap.get(uid);
  if (!item) {
    throw new Error(`area "${uid}" not found`);
  }
  if (item.type !== 'area') {
    throw new Error(`"${uid}" is a ${item.type}, not an area`);
  }
  return item;
}

export function requireProject(data: ITaskModelData, uid: string): TaskObjectSchema {
  const item = data.taskObjectUidMap.get(uid);
  if (!item) {
    throw new Error(`project "${uid}" not found`);
  }
  if (item.type !== 'project') {
    throw new Error(`"${uid}" is a ${item.type}, not a project`);
  }
  return item;
}

export function requireHeading(data: ITaskModelData, uid: string): TaskObjectSchema {
  const item = data.taskObjectUidMap.get(uid);
  if (!item) {
    throw new Error(`heading "${uid}" not found`);
  }
  if (item.type !== 'projectHeading') {
    throw new Error(`"${uid}" is a ${item.type}, not a heading`);
  }
  return item;
}

/** `YYYY-MM-DD` / `today` → utc date timestamp; `none` → null (clear). */
export function parseDateFlag(name: string, value: string): number | null {
  if (value === 'none') {
    return null;
  }
  if (value === 'today') {
    const d = new Date();
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`--${name} must be YYYY-MM-DD, "today" or "none"`);
  }
  const timestamp = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const parsed = new Date(timestamp);
  if (
    Number.isNaN(timestamp) ||
    parsed.getUTCFullYear() !== Number(match[1]) ||
    parsed.getUTCMonth() !== Number(match[2]) - 1 ||
    parsed.getUTCDate() !== Number(match[3])
  ) {
    throw new Error(`--${name}: invalid date "${value}"`);
  }
  return timestamp;
}

export function parseTagsFlag(value: string): string[] {
  if (value === 'none') {
    return [];
  }
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseIdsFlag(value: string): string[] {
  const ids = value
    .split(',')
    .map((id) => stripItemIdPrefix(id.trim()))
    .filter(Boolean);
  if (ids.length === 0) {
    throw new Error('--id must contain at least one id');
  }
  return [...new Set(ids)];
}

export function parsePositionFlag(value: string): CliItemPosition {
  const separator = value.indexOf(':');
  const type = separator === -1 ? value : value.slice(0, separator);
  const uid = separator === -1 ? '' : stripItemIdPrefix(value.slice(separator + 1).trim());
  if (type === 'firstElement') {
    return {
      type,
      parentUid: uid && uid !== 'root' && uid !== 'inbox' ? uid : undefined,
    };
  }
  if (type === 'afterElement' && uid) {
    return { type, previousElementUid: uid };
  }
  if (type === 'beforeElement' && uid) {
    return { type, nextElementUid: uid };
  }
  throw new Error(
    '--position must be firstElement:<parent-id>, afterElement:<sibling-id>, or beforeElement:<sibling-id>'
  );
}

const PLACEMENT_ERRORS: Record<PlacementErrorCode, string> = {
  positionReferenceMissing: 'position reference not found',
  parentMissing: 'position parent not found',
  parentType: 'invalid position: the parent cannot hold this item type',
  positionSelf: 'an item cannot be positioned relative to itself',
  nestingTooDeep: 'a subtask cannot have subtasks of its own',
  subjectHasChildren: 'a task with subtasks cannot be nested under another task',
  moveIntoTask: 'a task cannot be moved under another task; create it there instead',
  subtaskParentLocked: 'a subtask cannot be moved out of its parent task',
};

/**
 * Pre-flight so the CLI fails before submitting. The renderer re-runs the
 * same rules from {@link checkPlacement} at approve time — this call is for
 * feedback quality, not safety.
 *
 * Pass `uid` for an existing item being moved, `hasChildren` for an item
 * about to be created with a subtree of its own.
 */
export function validatePosition(
  data: ITaskModelData,
  position: CliItemPosition,
  subject: PlacementSubject,
  mode: PlacementMode = subject.uid ? 'move' : 'create'
): void {
  const item = subject.uid ? data.taskObjectUidMap.get(subject.uid) : undefined;
  const code = checkPlacement(
    data,
    {
      ...subject,
      hasChildren: subject.hasChildren ?? ((item as { children?: string[] } | undefined)?.children ?? []).length > 0,
    },
    position,
    mode
  );
  if (code) {
    // name the item so the message says which task was rejected, not just a uid
    const label = item ? `"${item.title || subject.uid}": ` : '';
    throw new Error(`${label}${PLACEMENT_ERRORS[code]}`);
  }
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function requiredTitle(value: Record<string, unknown>, label: string): string {
  if (typeof value.title !== 'string' || value.title.trim().length === 0) {
    throw new Error(`${label}.title is required`);
  }
  return value.title;
}

function optionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error(`${label} must be a string`);
  }
  return value;
}

function optionalTags(value: unknown, label: string): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value) || !value.every((tag) => typeof tag === 'string')) {
    throw new Error(`${label} must be an array of strings`);
  }
  return value;
}

function optionalCreateDate(value: unknown, label: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error(`${label} must be YYYY-MM-DD`);
  }
  const parsed = parseDateFlag(label, value);
  if (parsed === null) {
    throw new Error(`${label} cannot be "none"`);
  }
  return parsed;
}

function childrenArray(value: unknown, label: string): unknown[] {
  if (value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    return [value];
  }
  throw new Error(`${label} must be an array or object`);
}

/**
 * `allowChildren` is false once we are already inside a task: subtasks are
 * limited to one level, so a task's children may not have children of their
 * own. See `base/common/cliApproval/placement.ts`.
 */
function parseCreateTask(value: unknown, label: string, allowChildren = true): CliCreateTask {
  if (typeof value === 'string') {
    return { type: 'task', title: value };
  }
  const item = objectValue(value, label);
  if (item.type !== undefined && item.type !== 'task') {
    throw new Error(`${label}.type must be "task"`);
  }
  const children = childrenArray(item.children, `${label}.children`);
  if (!allowChildren && children.length > 0) {
    throw new Error(`${label}.children: a subtask cannot have subtasks of its own`);
  }
  return {
    type: 'task',
    title: requiredTitle(item, label),
    notes: optionalString(item.notes, `${label}.notes`),
    startDate: optionalCreateDate(item.startDate, `${label}.startDate`),
    dueDate: optionalCreateDate(item.dueDate, `${label}.dueDate`),
    tags: optionalTags(item.tags, `${label}.tags`),
    children: children.map((child, index) => parseCreateTask(child, `${label}.children[${index}]`, false)),
  };
}

function parseCreateHeading(value: Record<string, unknown>, label: string): CliCreateHeading {
  return {
    type: 'heading',
    title: requiredTitle(value, label),
    children: childrenArray(value.children, `${label}.children`).map((child, index) =>
      parseCreateTask(child, `${label}.children[${index}]`)
    ),
  };
}

function parseCreateProject(value: Record<string, unknown>, label: string): CliCreateProject {
  return {
    type: 'project',
    title: requiredTitle(value, label),
    notes: optionalString(value.notes, `${label}.notes`),
    startDate: optionalCreateDate(value.startDate, `${label}.startDate`),
    dueDate: optionalCreateDate(value.dueDate, `${label}.dueDate`),
    tags: optionalTags(value.tags, `${label}.tags`),
    children: childrenArray(value.children, `${label}.children`).map((child, index) => {
      const childLabel = `${label}.children[${index}]`;
      if (typeof child === 'string') {
        return parseCreateTask(child, childLabel);
      }
      const item = objectValue(child, childLabel);
      if (item.type === 'heading') {
        return parseCreateHeading(item, childLabel);
      }
      return parseCreateTask(item, childLabel);
    }),
  };
}

function parseCreateItem(value: unknown, label: string): CliCreateItem {
  if (typeof value === 'string') {
    return parseCreateTask(value, label);
  }
  const item = objectValue(value, label);
  if (item.type === 'project') {
    return parseCreateProject(item, label);
  }
  if (item.type === 'heading') {
    return parseCreateHeading(item, label);
  }
  return parseCreateTask(item, label);
}

export function parseCreateItemsFlag(value: string): CliCreateItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('--content must be valid JSON');
  }
  const values = Array.isArray(parsed) ? parsed : [parsed];
  if (values.length === 0) {
    throw new Error('content must contain at least one item');
  }
  return values.map((item, index) => parseCreateItem(item, `content[${index}]`));
}

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
};

export async function readExplanation(flags: {
  explanation?: string;
  'explanation-images'?: string;
}): Promise<CliExplanation | undefined> {
  if (flags.explanation === undefined && flags['explanation-images'] === undefined) return undefined;
  let sources: string[];
  try {
    sources = z.array(z.string()).parse(JSON.parse(flags['explanation-images'] ?? '[]'));
  } catch {
    throw new Error('--explanation-images must be a JSON array of local image paths');
  }
  const images: CliExplanationImage[] = [];
  for (const source of sources) {
    if (/^https?:\/\//i.test(source)) {
      throw new Error('--explanation-images only accepts local image paths');
    }
    images.push({
      filename: path.basename(source),
      mimetype: MIME_TYPES[path.extname(source).toLowerCase()] || 'application/octet-stream',
      base64: (await fs.readFile(source)).toString('base64'),
    });
  }
  return { text: flags.explanation ?? '', images };
}
