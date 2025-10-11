import { LoroMap } from 'loro-crdt';
import { ModelKeys } from '../enum';
import { calculateRecurringDate } from '../time/calculateRecurringDate';
import { CreateTaskSchema, RecurringRule, TaskLoroSchema } from '../type';
import { formatUTCTimeStampToDate } from '../time/formatUTCTimeStamp';
import { formatTimeStampToDate } from '../time/formatTimeStampToDate';

function calculateBaseTime(
  dateBase: 'completion' | 'due' | 'start' | undefined,
  completionAt: number | undefined,
  map: LoroMap<TaskLoroSchema>
): string {
  const defaultTime = completionAt ?? Date.now();

  if (dateBase === 'due' && map.get(ModelKeys.dueDate)) {
    return formatUTCTimeStampToDate(map.get(ModelKeys.dueDate) as number);
  }
  if (dateBase === 'start' && map.get(ModelKeys.startDate)) {
    return formatUTCTimeStampToDate(map.get(ModelKeys.startDate) as number);
  }
  return formatTimeStampToDate(defaultTime);
}

export function createRecurringTask(map: LoroMap<TaskLoroSchema>, completionAt?: number): CreateTaskSchema | null {
  const recurringRuleString = map.get(ModelKeys.recurringRule) as string;

  if (!recurringRuleString) {
    return null;
  }

  let recurringRule: RecurringRule;
  try {
    recurringRule = JSON.parse(recurringRuleString);
  } catch {
    return null;
  }

  if (!recurringRule.startDate && !recurringRule.dueDate) {
    return null;
  }

  let calculatedStartDate = 0;
  if (recurringRule.startDate) {
    calculatedStartDate = calculateRecurringDate(
      recurringRule.startDate,
      calculateBaseTime(recurringRule.startDateBase, completionAt, map)
    ).getTime();
  }

  let calculatedDueDate = 0;
  if (recurringRule.dueDate) {
    calculatedDueDate = calculateRecurringDate(
      recurringRule.dueDate,
      calculateBaseTime(recurringRule.dueDateBase, completionAt, map)
    ).getTime();
  }

  return {
    title: map.get(ModelKeys.title),
    notes: map.get(ModelKeys.notes),
    tags: map.get(ModelKeys.tags).toArray(),
    startDate: calculatedStartDate,
    dueDate: calculatedDueDate,
    recurringRule,
  };
}
