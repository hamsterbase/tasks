import type { TreeID } from 'loro-crdt';
import { ITaskModelData, ProjectInfoState, TaskInfo } from '../type';

export type TodayGroupKind = 'noParent' | 'area' | 'project';

export type TodayGroupItem = { type: 'task'; task: TaskInfo } | { type: 'project'; project: ProjectInfoState };

/**
 * Synthetic sortable id used by the heading row of a group. Exposed so the
 * collision strategy and the drag-action resolver can recognise heading drops
 * without duplicating the format.
 */
export const TODAY_GROUP_HEADING_PREFIX = 'today:group-header:';
export const todayGroupHeadingId = (groupId: string) => `${TODAY_GROUP_HEADING_PREFIX}${groupId}`;

export interface TodayGroup {
  /**
   * Synthetic id used for keying and drag containers.
   * - 'noParent'           — orphan tasks/projects (no header)
   * - 'area:<id>'          — area-rooted tasks and projects
   * - 'project:<id>'       — tasks belonging to a project (incl. its headings)
   */
  id: string;
  /**
   * Synthetic id for the heading sortable row. `null` for the noParent group,
   * which has no header.
   */
  headingId: string | null;
  kind: TodayGroupKind;
  /**
   * Container the group represents:
   * - noParent → null
   * - area     → area id
   * - project  → project id
   */
  parentId: TreeID | null;
  title: string;
  items: TodayGroupItem[];
}

export interface GroupedTodayItems {
  groups: TodayGroup[];
}

interface TaskGroupKey {
  kind: TodayGroupKind;
  parentId: TreeID | null;
  title: string;
}

/**
 * Resolve which group a task belongs to. Tasks can be parented to a project,
 * project heading (whose grandparent is the project), area, or another task.
 * Sub-tasks (parented to another task) fall through to the noParent group, but
 * in practice they don't appear in the Today list.
 */
function resolveTaskGroupKey(modelData: ITaskModelData, task: TaskInfo): TaskGroupKey {
  const parentId = task.parentId;
  if (!parentId) {
    return { kind: 'noParent', parentId: null, title: '' };
  }
  const parent = modelData.taskObjectMap.get(parentId);
  if (!parent) {
    return { kind: 'noParent', parentId: null, title: '' };
  }
  if (parent.type === 'project') {
    return { kind: 'project', parentId: parentId as TreeID, title: parent.title ?? '' };
  }
  if (parent.type === 'projectHeading') {
    const projectId = parent.parentId as TreeID | undefined;
    if (projectId) {
      const projectNode = modelData.taskObjectMap.get(projectId);
      return {
        kind: 'project',
        parentId: projectId,
        title: projectNode?.type === 'project' ? (projectNode.title ?? '') : '',
      };
    }
    return { kind: 'noParent', parentId: null, title: '' };
  }
  if (parent.type === 'area') {
    return { kind: 'area', parentId: parentId as TreeID, title: parent.title ?? '' };
  }
  return { kind: 'noParent', parentId: null, title: '' };
}

function resolveProjectGroupKey(modelData: ITaskModelData, project: ProjectInfoState): TaskGroupKey {
  const node = modelData.taskObjectMap.get(project.id);
  const parentId = node?.type === 'project' ? node.parentId : undefined;
  if (!parentId) {
    return { kind: 'noParent', parentId: null, title: '' };
  }
  const parent = modelData.taskObjectMap.get(parentId);
  if (parent?.type === 'area') {
    return { kind: 'area', parentId: parentId as TreeID, title: parent.title ?? '' };
  }
  return { kind: 'noParent', parentId: null, title: '' };
}

function makeGroupId(kind: TodayGroupKind, parentId: TreeID | null): string {
  if (kind === 'noParent') {
    return 'noParent';
  }
  return `${kind}:${parentId}`;
}

/**
 * Group today's items into a flat list of sections that mix tasks and projects:
 *
 * 1. noParent — tasks without a parent and projects without an area (no header)
 * 2. area:<id> — area-rooted tasks and projects (one group per area)
 * 3. project:<id> — tasks belonging to a project (one group per project)
 *
 * Within each kind, groups appear in the order their first member appears in
 * the date-assigned list, so the view stays stable as items reorder.
 */
export function groupTodayItems(items: (TaskInfo | ProjectInfoState)[], modelData: ITaskModelData): GroupedTodayItems {
  const groupMap = new Map<string, TodayGroup>();
  const noParentId = 'noParent';
  const areaOrder: string[] = [];
  const projectOrder: string[] = [];

  for (const item of items) {
    const key =
      item.type === 'project' ? resolveProjectGroupKey(modelData, item) : resolveTaskGroupKey(modelData, item);
    const id = makeGroupId(key.kind, key.parentId);
    let group = groupMap.get(id);
    if (!group) {
      group = {
        id,
        headingId: key.kind === 'noParent' ? null : todayGroupHeadingId(id),
        kind: key.kind,
        parentId: key.parentId,
        title: key.title,
        items: [],
      };
      groupMap.set(id, group);
      if (key.kind === 'area') {
        areaOrder.push(id);
      } else if (key.kind === 'project') {
        projectOrder.push(id);
      }
    }
    if (item.type === 'project') {
      group.items.push({ type: 'project', project: item });
    } else {
      group.items.push({ type: 'task', task: item });
    }
  }

  const ordered: TodayGroup[] = [];
  const noParent = groupMap.get(noParentId);
  if (noParent) {
    ordered.push(noParent);
  }
  for (const id of areaOrder) {
    const group = groupMap.get(id);
    if (group) ordered.push(group);
  }
  for (const id of projectOrder) {
    const group = groupMap.get(id);
    if (group) ordered.push(group);
  }

  return { groups: ordered };
}
