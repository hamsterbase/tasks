import { RepeatIcon } from '@/components/icons';
import { recurringToString } from '@/core/time/recurringToString';
import { RecurringRule } from '@/core/type';
import { useRecurringTaskSettings } from '@/desktop/overlay/recurringTaskSettings/useRecurringTaskSettings';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { TreeID } from 'loro-crdt';
import React from 'react';

interface RecurringRuleFieldProps {
  taskId: TreeID;
  recurringRule?: RecurringRule;
}

function formatRecurringRule(rule?: RecurringRule): string[] {
  if (!rule) {
    return [];
  }

  const parts: string[] = [];

  if (rule.startDate) {
    parts.push(localize('tasks.recurring_start_date', 'StartDate: {0}', recurringToString(rule.startDate)));
  }

  if (rule.dueDate) {
    parts.push(localize('tasks.recurring_due_date', 'DueDate: {0}', recurringToString(rule.dueDate)));
  }

  return parts;
}

export const RecurringRuleField: React.FC<RecurringRuleFieldProps> = ({ recurringRule, taskId }) => {
  const todoService = useService(ITodoService);
  const openRecurringTaskSettings = useRecurringTaskSettings();

  const handleClick = () => {
    openRecurringTaskSettings(recurringRule || {}, (settings) => {
      todoService.updateTask(taskId, {
        recurringRule: settings,
      });
    });
  };

  const displayText = formatRecurringRule(recurringRule);

  if (!displayText || displayText.length === 0) {
    return null;
  }

  return (
    <button className={desktopStyles.SelectionFieldButton} onClick={handleClick}>
      <div className={desktopStyles.SelectionFieldIcon}>
        <RepeatIcon />
      </div>
      <div className={desktopStyles.RecurringRuleContent}>
        {displayText.map((text) => (
          <span key={text}>{text}</span>
        ))}
      </div>
    </button>
  );
};
