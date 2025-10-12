import { LoroMap, TreeID } from 'loro-crdt';
import { ModelKeys } from '../enum';
import { calculateRecurringDate } from '../time/calculateRecurringDate';
import { formatTimeStampToDate } from '../time/formatTimeStampToDate';
import { formatUTCTimeStampToDate } from '../time/formatUTCTimeStamp';
import { CreateTaskSchema, RecurringRule, TaskLoroSchema } from '../type';

function calculateBaseTime(
  dateBase: string | undefined,
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

export function createRecurringTask(
  id: TreeID,
  map: LoroMap<TaskLoroSchema>,
  completionAt?: number
): CreateTaskSchema | null {
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
      calculateBaseTime(recurringRule.startDate.from, completionAt, map)
    ).getTime();
  }

  let calculatedDueDate = 0;
  if (recurringRule.dueDate) {
    calculatedDueDate = calculateRecurringDate(
      recurringRule.dueDate,
      calculateBaseTime(recurringRule.dueDate.from, completionAt, map)
    ).getTime();
  }

  return {
    title: map.get(ModelKeys.title),
    notes: map.get(ModelKeys.notes),
    tags: map.get(ModelKeys.tags).toArray(),
    startDate: calculatedStartDate,
    dueDate: calculatedDueDate,
    recurringRule,
    position: {
      type: 'afterElement',
      previousElementId: id,
    },
  };
}
