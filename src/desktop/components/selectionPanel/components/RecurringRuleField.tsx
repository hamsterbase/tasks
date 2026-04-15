import { Repeat2Icon } from '@/components/icons';
import { calculateRecurringDate } from '@/core/time/calculateRecurringDate';
import { formatTimeStampToDate } from '@/core/time/formatTimeStampToDate';
import { formatUTCTimeStampToDate } from '@/core/time/formatUTCTimeStamp';
import { RecurringDateRule } from '@/core/time/parseRecurringRule';
import { recurringToString } from '@/core/time/recurringToString';
import { RecurringRule } from '@/core/type';
import { useRecurringTaskSettings } from '@/desktop/overlay/recurringTaskSettings/useRecurringTaskSettings';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { TreeID } from 'loro-crdt';
import React from 'react';
import { TaskDetailAttributeRow } from './TaskDetailAttributeRow';

interface RecurringRuleFieldProps {
  taskId: TreeID;
  recurringRule?: RecurringRule;
  taskStartDate?: number;
  taskDueDate?: number;
  testId?: string;
}

function getRecurringBaseDate(rule: RecurringDateRule, taskStartDate?: number, taskDueDate?: number) {
  if (rule.from === 'due' && taskDueDate) {
    return formatUTCTimeStampToDate(taskDueDate);
  }
  if (rule.from === 'start' && taskStartDate) {
    return formatUTCTimeStampToDate(taskStartDate);
  }
  return formatTimeStampToDate(Date.now());
}

function getNextOccurrence(rule: RecurringDateRule, taskStartDate?: number, taskDueDate?: number) {
  return formatUTCTimeStampToDate(
    calculateRecurringDate(rule, getRecurringBaseDate(rule, taskStartDate, taskDueDate)).getTime()
  );
}

function getRecurringSummaryItems(rule: RecurringRule | undefined, taskStartDate?: number, taskDueDate?: number) {
  if (!rule) {
    return [];
  }

  const items: { key: 'startDate' | 'dueDate'; title: string; value: string }[] = [];

  if (rule.startDate && recurringToString(rule.startDate)) {
    items.push({
      key: 'startDate',
      title: localize('desktop.task_detail.start_date', 'Start Date'),
      value: getNextOccurrence(rule.startDate, taskStartDate, taskDueDate),
    });
  }

  if (rule.dueDate && recurringToString(rule.dueDate)) {
    items.push({
      key: 'dueDate',
      title: localize('desktop.task_detail.due_date', 'Due Date'),
      value: getNextOccurrence(rule.dueDate, taskStartDate, taskDueDate),
    });
  }

  return items;
}

export const RecurringRuleField: React.FC<RecurringRuleFieldProps> = ({
  recurringRule,
  taskId,
  taskStartDate,
  taskDueDate,
  testId,
}) => {
  const todoService = useService(ITodoService);
  const openRecurringTaskSettings = useRecurringTaskSettings();

  const handleClick = () => {
    openRecurringTaskSettings(recurringRule || {}, (settings) => {
      todoService.updateTask(taskId, {
        recurringRule: settings,
      });
    });
  };

  const summaryItems = getRecurringSummaryItems(recurringRule, taskStartDate, taskDueDate);

  return (
    <TaskDetailAttributeRow
      icon={<Repeat2Icon className={desktopStyles.TaskDetailAttributeIcon} />}
      label={localize('tasks.recurring', 'Repeat')}
      dataTestId={testId}
      onClick={handleClick}
      placeholder={summaryItems.length === 0}
      content={
        summaryItems.length === 0 ? (
          localize('tasks.recurring_placeholder', 'Not set')
        ) : (
          <div className={desktopStyles.RecurringRuleContent}>
            <div className={desktopStyles.RecurringRuleSummaryHint}>
              {localize('tasks.recurring_next_label', 'Next task')}
            </div>
            {summaryItems.map((item) => (
              <div key={item.key} className={desktopStyles.RecurringRuleSummaryItem}>
                <span className={desktopStyles.RecurringRuleSummaryTitle}>{item.title}</span>
                <span className={desktopStyles.RecurringRuleSummaryValue}>{item.value}</span>
              </div>
            ))}
          </div>
        )
      }
    />
  );
};
