import { CliExplanation, cliExplanationSchema } from './explanation';
import type { ItemStatus } from '../../../core/type';

/**
 * Shared protocol between the CLI, the Electron main process and the renderer.
 *
 * The CLI submits change requests over a local socket (unix domain socket /
 * windows named pipe). The Electron main process keeps them in an in-memory
 * queue until the user approves or rejects them in the renderer. Everything in
 * this file must stay environment agnostic (no node / dom imports).
 *
 * Items are always referenced by their stable `uid` (nanoid), never by loro
 * TreeID: the CLI reads uids from disk snapshots and the renderer resolves
 * them back to TreeIDs at apply time.
 */

export type CliItemPosition =
  | {
      type: 'firstElement';
      /** omitted means the root (inbox for tasks) */
      parentUid?: string;
    }
  | {
      type: 'afterElement';
      previousElementUid: string;
    }
  | {
      type: 'beforeElement';
      nextElementUid: string;
    };

export interface CliTaskUpdatePayload {
  title?: string;
  notes?: string;
  /** utc timestamp of a date (YYYY-MM-DD), null clears the field */
  startDate?: number | null;
  dueDate?: number | null;
  /** full replacement */
  tags?: string[];
  status?: ItemStatus;
  position?: CliItemPosition;
}

export interface CliProjectUpdatePayload {
  title?: string;
  notes?: string;
  startDate?: number | null;
  dueDate?: number | null;
  tags?: string[];
  position?: CliItemPosition;
}

export interface CliHeadingUpdatePayload {
  title?: string;
  position?: CliItemPosition;
}

export interface CliAreaUpdatePayload {
  title?: string;
  tags?: string[];
  position?: CliItemPosition;
}

export interface CliCreateTask {
  type: 'task';
  title: string;
  notes?: string;
  startDate?: number;
  dueDate?: number;
  tags?: string[];
  children?: CliCreateTask[];
}

export interface CliCreateHeading {
  type: 'heading';
  title: string;
  children?: CliCreateTask[];
}

export interface CliCreateProject {
  type: 'project';
  title: string;
  notes?: string;
  startDate?: number;
  dueDate?: number;
  tags?: string[];
  children?: Array<CliCreateTask | CliCreateHeading>;
}

export type CliCreateItem = CliCreateTask | CliCreateHeading | CliCreateProject;

/**
 * `id` is stamped by the pending queue on arrival, never sent by the CLI.
 * Approval refs point at it rather than an array index: removing one op
 * compacts the array, so an index captured before a removal (a confirmation
 * dialog left open, a double click) would afterwards name a different op.
 */
export type CliChangeOp = { id?: string } & (
  | {
      type: 'create-task';
      title: string;
      notes?: string;
      startDate?: number;
      dueDate?: number;
      tags?: string[];
      /** omitted = first item in the inbox */
      position?: CliItemPosition;
    }
  | {
      type: 'create-project';
      title: string;
      /** uid of an area; omitted = root project */
      parentUid?: string;
    }
  | {
      type: 'create-heading';
      title: string;
      position: CliItemPosition;
    }
  | { type: 'create-area'; title: string }
  | { type: 'update-task'; uid: string; payload: CliTaskUpdatePayload }
  | { type: 'update-heading'; uid: string; payload: CliHeadingUpdatePayload }
  | { type: 'update-project'; uid: string; payload: CliProjectUpdatePayload }
  | { type: 'update-area'; uid: string; payload: CliAreaUpdatePayload }
  | { type: 'delete-task'; uid: string }
  | { type: 'delete-area'; uid: string }
  | {
      type: 'create-items';
      /** ordered top-level items; nested children are created in the same approval */
      items: CliCreateItem[];
      /** omitted = first element at the root */
      position?: CliItemPosition;
    }
);

export interface CliChangeRequest {
  explanation?: CliExplanation;
  requestId: string;
  /** must match the database currently opened in the client */
  databaseId: string;
  createdAt: number;
  source: 'cli';
  ops: CliChangeOp[];
}

/** one approvable entry: a single op inside a pending request */
export interface CliApprovalOpRef {
  requestId: string;
  /** {@link CliChangeOp.id}; stable across removals of sibling ops */
  opId: string;
}

/**
 * Version of the CLI approval protocol this build speaks. A new desktop app
 * always keeps working with an older CLI, so only one direction needs guarding:
 * a newer CLI asking an older app to understand something it cannot.
 *
 * Bump it only when this file's wire shape changes — a new {@link CliChangeOp}
 * kind, a new request field, a new response shape — and in the same change set
 * the `minProtocolVersion` of the commands that rely on it. Adding a CLI
 * command that only composes existing ops needs no bump.
 */
export const CLI_PROTOCOL_VERSION = 3;

/** written next to the socket so the CLI can discover running instances */
export interface CliInstanceInfo {
  instanceId: string;
  pid: number;
  socketPath: string;
  /** database currently opened in the renderer; empty until first report */
  databaseId: string;
  startedAt: number;
  /**
   * Highest protocol version this app understands. Absent in apps built before
   * the field existed, which is why readers must treat it as
   * {@link OLDEST_PROTOCOL_VERSION}.
   */
  protocolVersion?: number;
  /** Desktop app version, shown when the CLI asks the user to update it. */
  appVersion?: string;
}

/** What an app that reports no version is assumed to speak. */
export const OLDEST_PROTOCOL_VERSION = 1;

/** Protocol version an instance speaks, defaulting apps that predate the field. */
export function instanceProtocolVersion(info: CliInstanceInfo): number {
  return info.protocolVersion ?? OLDEST_PROTOCOL_VERSION;
}

export interface CliAttachmentRequest {
  id: string;
  type: 'read-attachment';
  databaseId: string;
  parentUid: string;
  attachmentId: string;
}

export const CLI_ATTACHMENT_MAX_BYTES = 32 * 1024 * 1024;

export interface CliAttachmentDownload {
  base64: string;
  filename: string;
  mimetype: string;
  size: number;
}

export type CliSocketRequest = { id: string; type: 'submit'; request: CliChangeRequest } | CliAttachmentRequest;

export type CliSocketResponse =
  | { id: string; ok: true; attachment?: CliAttachmentDownload }
  | { id: string; ok: false; error: string };

export const CLI_APPROVAL_MAX_PENDING = 100;

export function serializeMessage(message: unknown): string {
  return `${JSON.stringify(message)}\n`;
}

/**
 * Incremental ndjson decoder: feed raw chunks, get parsed messages. Invalid
 * json lines are surfaced as errors so the peer can reply instead of hanging.
 */
export class NdjsonDecoder {
  private buffer = '';

  append(chunk: string): Array<{ value?: unknown; error?: string }> {
    this.buffer += chunk;
    const result: Array<{ value?: unknown; error?: string }> = [];
    let index = this.buffer.indexOf('\n');
    while (index !== -1) {
      const line = this.buffer.slice(0, index).trim();
      this.buffer = this.buffer.slice(index + 1);
      if (line) {
        try {
          result.push({ value: JSON.parse(line) });
        } catch {
          result.push({ error: 'invalid json' });
        }
      }
      index = this.buffer.indexOf('\n');
    }
    return result;
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function validatePosition(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  const position = value;
  if (position.type === 'firstElement') {
    return (
      hasOnlyKeys(position, ['type', 'parentUid']) &&
      (position.parentUid === undefined || isNonEmptyString(position.parentUid))
    );
  }
  if (position.type === 'afterElement') {
    return hasOnlyKeys(position, ['type', 'previousElementUid']) && isNonEmptyString(position.previousElementUid);
  }
  if (position.type === 'beforeElement') {
    return hasOnlyKeys(position, ['type', 'nextElementUid']) && isNonEmptyString(position.nextElementUid);
  }
  return false;
}

function validateCreateFields(value: Record<string, unknown>): boolean {
  return (
    (value.notes === undefined || typeof value.notes === 'string') &&
    (value.startDate === undefined || isFiniteNumber(value.startDate)) &&
    (value.dueDate === undefined || isFiniteNumber(value.dueDate)) &&
    (value.tags === undefined || isStringArray(value.tags))
  );
}

/**
 * `allowChildren` is false for tasks that are already subtasks: a task may
 * hold one level of subtasks, never two. See `placement.ts` for the rule.
 */
function validateCreateTask(value: unknown, allowChildren = true): boolean {
  if (!isRecord(value)) {
    return false;
  }
  const task = value;
  if (
    !hasOnlyKeys(task, ['type', 'title', 'notes', 'startDate', 'dueDate', 'tags', 'children']) ||
    task.type !== 'task' ||
    !isNonEmptyString(task.title) ||
    !validateCreateFields(task)
  ) {
    return false;
  }
  if (task.children === undefined) {
    return true;
  }
  if (!Array.isArray(task.children)) {
    return false;
  }
  if (!allowChildren && task.children.length > 0) {
    return false;
  }
  return task.children.every((child) => validateCreateTask(child, false));
}

function validateCreateHeading(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  const heading = value;
  return (
    hasOnlyKeys(heading, ['type', 'title', 'children']) &&
    heading.type === 'heading' &&
    isNonEmptyString(heading.title) &&
    (heading.children === undefined ||
      (Array.isArray(heading.children) && heading.children.every((task) => validateCreateTask(task))))
  );
}

function validateCreateProject(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  const project = value;
  if (
    !hasOnlyKeys(project, ['type', 'title', 'notes', 'startDate', 'dueDate', 'tags', 'children']) ||
    project.type !== 'project' ||
    !isNonEmptyString(project.title) ||
    !validateCreateFields(project)
  ) {
    return false;
  }
  if (project.children === undefined) {
    return true;
  }
  return (
    Array.isArray(project.children) &&
    project.children.every((child) => {
      if (!isRecord(child)) {
        return false;
      }
      const item = child;
      if (item.type === 'task') {
        return validateCreateTask(item);
      }
      return validateCreateHeading(item);
    })
  );
}

function validateCreateItem(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  const item = value;
  if (item.type === 'task') {
    return validateCreateTask(item);
  }
  if (item.type === 'heading') {
    return validateCreateHeading(item);
  }
  return validateCreateProject(item);
}

function validateUpdatePayload(type: string, payload: Record<string, unknown>): string | null {
  const allowedByType: Record<string, readonly string[]> = {
    'update-task': ['title', 'notes', 'startDate', 'dueDate', 'tags', 'status', 'position'],
    'update-heading': ['title', 'position'],
    'update-project': ['title', 'notes', 'startDate', 'dueDate', 'tags', 'position'],
    'update-area': ['title', 'tags', 'position'],
  };
  const allowed = allowedByType[type];
  if (!allowed || !hasOnlyKeys(payload, allowed)) {
    return `${type}: invalid payload`;
  }
  if (payload.position !== undefined && !validatePosition(payload.position)) {
    return `${type}: invalid position`;
  }
  if (
    type === 'update-task' &&
    payload.status !== undefined &&
    payload.status !== 'created' &&
    payload.status !== 'completed' &&
    payload.status !== 'canceled'
  ) {
    return 'update-task: invalid status';
  }

  const commonFieldsAreValid =
    (payload.title === undefined || isNonEmptyString(payload.title)) &&
    (payload.notes === undefined || typeof payload.notes === 'string') &&
    (payload.startDate === undefined || payload.startDate === null || isFiniteNumber(payload.startDate)) &&
    (payload.dueDate === undefined || payload.dueDate === null || isFiniteNumber(payload.dueDate)) &&
    (payload.tags === undefined || isStringArray(payload.tags));
  return commonFieldsAreValid ? null : `${type}: invalid payload`;
}

function validateOp(op: unknown): string | null {
  if (!isRecord(op)) {
    return 'op must be an object';
  }
  const value = op;
  switch (value.type) {
    case 'create-task': {
      if (!isNonEmptyString(value.title)) {
        return 'create-task: title is required';
      }
      if (value.position !== undefined && !validatePosition(value.position)) {
        return 'create-task: invalid position';
      }
      return hasOnlyKeys(value, ['type', 'title', 'notes', 'startDate', 'dueDate', 'tags', 'position']) &&
        validateCreateFields(value)
        ? null
        : 'create-task: invalid fields';
    }
    case 'create-project':
      if (!isNonEmptyString(value.title)) {
        return 'create-project: title is required';
      }
      return hasOnlyKeys(value, ['type', 'title', 'parentUid']) &&
        (value.parentUid === undefined || isNonEmptyString(value.parentUid))
        ? null
        : 'create-project: invalid fields';
    case 'create-heading':
      if (!isNonEmptyString(value.title)) {
        return 'create-heading: title is required';
      }
      if (value.position === undefined) {
        return 'create-heading: position is required';
      }
      if (!validatePosition(value.position)) {
        return 'create-heading: invalid position';
      }
      return hasOnlyKeys(value, ['type', 'title', 'position']) ? null : 'create-heading: invalid fields';
    case 'create-area':
      if (!isNonEmptyString(value.title)) {
        return 'create-area: title is required';
      }
      return hasOnlyKeys(value, ['type', 'title']) ? null : 'create-area: invalid fields';
    case 'update-task':
    case 'update-heading':
    case 'update-project':
    case 'update-area':
      if (!isNonEmptyString(value.uid)) {
        return `${value.type}: uid is required`;
      }
      if (!isRecord(value.payload) || Object.keys(value.payload).length === 0) {
        return `${value.type}: payload is empty`;
      }
      if (!hasOnlyKeys(value, ['type', 'uid', 'payload'])) {
        return `${value.type}: invalid fields`;
      }
      return validateUpdatePayload(value.type, value.payload);
    case 'delete-task':
    case 'delete-area':
      if (!isNonEmptyString(value.uid)) {
        return `${value.type}: uid is required`;
      }
      return hasOnlyKeys(value, ['type', 'uid']) ? null : `${value.type}: invalid fields`;
    case 'create-items':
      if (value.position !== undefined && !validatePosition(value.position)) {
        return 'create-items: invalid position';
      }
      if (!hasOnlyKeys(value, ['type', 'items', 'position'])) {
        return 'create-items: invalid fields';
      }
      return Array.isArray(value.items) && value.items.length > 0 && value.items.every(validateCreateItem)
        ? null
        : 'create-items: invalid items';
    default:
      return `unknown op type: ${String(value.type)}`;
  }
}

/** returns an error message, or null when the request is well-formed */
export function validateChangeRequest(request: unknown): string | null {
  if (!request || typeof request !== 'object') {
    return 'request must be an object';
  }
  const value = request as Record<string, unknown>;
  if (!isNonEmptyString(value.requestId)) {
    return 'requestId is required';
  }
  if (!isNonEmptyString(value.databaseId)) {
    return 'databaseId is required';
  }
  if (!isFiniteNumber(value.createdAt)) {
    return 'createdAt must be a finite number';
  }
  if (value.source !== 'cli') {
    return 'source must be cli';
  }
  if (!hasOnlyKeys(value, ['requestId', 'databaseId', 'createdAt', 'source', 'ops', 'explanation'])) {
    return 'request has invalid fields';
  }
  if (!Array.isArray(value.ops) || value.ops.length === 0) {
    return 'ops must be a non-empty array';
  }
  if (value.explanation !== undefined) {
    const result = cliExplanationSchema.safeParse(value.explanation);
    if (!result.success) return `invalid explanation: ${result.error.issues[0].message}`;
  }
  for (const op of value.ops) {
    const error = validateOp(op);
    if (error) {
      return error;
    }
  }
  return null;
}
