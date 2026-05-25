import { compileTaskRule } from '@/core/filter/taskRuleCompiler';
import { buildTaskRuleItem } from '@/core/filter/taskRuleSchema';
import { FilterOption, isTaskVisible } from '@/core/time/filterProjectAndTask';
import type { TreeID } from 'loro-crdt';
import { getTaskInfo } from '../getTaskInfo';
import type { TagFilter } from '../getProjectHeadingAndTasks';
import type { ITaskModelData, TaskInfo } from '../type';
import { buildTaskRuleContext } from './buildTaskRuleContext';
import { groupViewItems, type ViewGroup } from './groupViewItems';

export interface ViewItemsResult {
  items: TaskInfo[];
  /**
   * Items bucketed by container (inbox / area / project) in stable order.
   */
  groups: ViewGroup[];
  /** Flat list of task ids in render order — convenient for IListService.setMainList. */
  itemIds: TreeID[];
  willDisappearObjectIdSet: Set<TreeID>;
  /** All tags seen across tasks matched by the rule (before tagsFilter). */
  allTags: string[];
}

/**
 * Filter the model's tasks by a view rule, then apply display settings + tag
 * filtering — parallel to {@link getTodayItems} but driven by a rule expression
 * instead of dateAssignedList.
 */
/**
 * Phase-1 evaluator: run the rule against the model and return just the
 * matched task ids, with no display-settings or tag filtering applied.
 *
 * Callers that want a "stable view" — items frozen until the user re-enters
 * the view or edits the rule — should compute this once and feed the result
 * back into {@link getViewItems} via `candidateIds`. That way, editing a task
 * so it no longer matches the rule won't yank it out of the visible list mid
 * session.
 */
export function matchRuleIds(rule: string, modelData: ITaskModelData): TreeID[] {
  if (rule.trim() === '') return [];
  const compiled = compileTaskRule(rule);
  if (!compiled.success) return [];

  const ids: TreeID[] = [];
  for (const obj of modelData.taskList) {
    if (obj.type !== 'task') continue;
    const ctx = buildTaskRuleContext(modelData, obj.parentId);
    const ruleItem = buildTaskRuleItem(obj, ctx);
    if (compiled.fn(ruleItem)) ids.push(obj.id);
  }
  return ids;
}

export function getViewItems(
  rule: string,
  modelData: ITaskModelData,
  today: number,
  filterOption?: FilterOption,
  tagsFilter: TagFilter = { type: 'all' },
  candidateIds?: TreeID[]
): ViewItemsResult {
  void today;

  const willDisappearObjectIdSet = new Set<TreeID>();
  const items: TaskInfo[] = [];
  const allTagsSet = new Set<string>();

  // Resolve the candidate task ids. When the caller passes a frozen snapshot
  // we skip rule evaluation and operate on those ids; otherwise we filter the
  // whole task list against the rule.
  let candidates: TreeID[];
  if (candidateIds) {
    candidates = candidateIds;
  } else {
    const trimmed = rule.trim();
    if (trimmed === '') {
      return { items, groups: [], itemIds: [], willDisappearObjectIdSet, allTags: [] };
    }
    const compiled = compileTaskRule(rule);
    if (!compiled.success) {
      return { items, groups: [], itemIds: [], willDisappearObjectIdSet, allTags: [] };
    }
    candidates = [];
    for (const obj of modelData.taskList) {
      if (obj.type !== 'task') continue;
      const ctx = buildTaskRuleContext(modelData, obj.parentId);
      const ruleItem = buildTaskRuleItem(obj, ctx);
      if (compiled.fn(ruleItem)) candidates.push(obj.id);
    }
  }

  const isEntityMatchedByTags = (entity: { tags?: string[] }): boolean => {
    if (tagsFilter.type === 'all') return true;
    if (tagsFilter.type === 'untagged') return !entity.tags || entity.tags.length === 0;
    return !!entity.tags?.includes(tagsFilter.value);
  };

  for (const id of candidates) {
    // Tasks in the locked snapshot may have been deleted from the model since;
    // skip those silently.
    if (!modelData.taskObjectMap.has(id)) continue;
    const task = getTaskInfo(modelData, id);
    const taskState = isTaskVisible(task, filterOption);
    if (taskState === 'invalid') continue;

    task.tags?.forEach((tag) => allTagsSet.add(tag));
    if (!isEntityMatchedByTags(task) && taskState !== 'recentChanged') continue;

    if (taskState === 'recentChanged') {
      willDisappearObjectIdSet.add(task.id);
    }
    items.push(task);
  }

  const groups = groupViewItems(items, modelData);
  const itemIds = groups.flatMap((group) => group.tasks.map((task) => task.id));

  return {
    items,
    groups,
    itemIds,
    willDisappearObjectIdSet,
    allTags: Array.from(allTagsSet).sort(),
  };
}
