import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { EditableTextArea } from '@/components/edit/EditableTextArea.tsx';
import { taskTitleInputKey } from '@/components/edit/inputKeys.ts';
import { DueIcon, MenuIcon, ScheduledIcon } from '@/components/icons';
import { TaskInfo } from '@/core/state/type.ts';
import { useTaskMenu } from '@/desktop/hooks/useTaskMenu.ts';
import { desktopStyles } from '@/desktop/theme/main.ts';
import { localize } from '@/nls';
import React from 'react';
import { TagsField } from '../TagsField';
import { ClearSelectionButton } from './ClearSelectionButton';
import { SubtaskList } from './SubtaskList';
import { NotesField } from './components/NotesField';
import { RecurringRuleField } from './components/RecurringRuleField';
import { RemindersField } from './components/RemindersField';
import { TaskDateField } from './components/TaskDateField';
import { TaskLocationField } from './components/TaskLocationField';
import { useDatePickerHandlers } from './hooks/useDatePickerHandlers';

interface TaskDetailViewProps {
  task: TaskInfo;
  onClearSelection?: () => void;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task, onClearSelection }) => {
  const taskItemActions = useTaskItemActions(task);
  const { openTaskMenu } = useTaskMenu(task.id, task);
  const { handleStartDateClick, handleDueDateClick } = useDatePickerHandlers({
    task,
  });

  const handleTitleSave = (value: string) => {
    taskItemActions.updateTaskTitle(value);
  };

  const handleNotesSave = (value: string) => {
    taskItemActions.updateTaskNotes(value);
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    openTaskMenu(rect.right, rect.bottom);
  };

  return (
    <div className={desktopStyles.DetailViewContainer}>
      <div className={desktopStyles.DetailViewHeader}>
        <EditableTextArea
          inputKey={taskTitleInputKey(task.id)}
          defaultValue={task.title}
          placeholder={localize('tasks.title_placeholder', 'Add title...')}
          onSave={handleTitleSave}
          className={desktopStyles.DetailViewHeaderTitle}
          autoSize={{ minRows: 1 }}
        />
        <button onClick={handleMenuClick} className={desktopStyles.DetailViewHeaderMenuButton}>
          <MenuIcon className={desktopStyles.DetailViewHeaderMenuIcon} />
        </button>
      </div>
      <div className={desktopStyles.DetailViewContent}>
        <div className={desktopStyles.DetailViewContentInner}>
          <NotesField
            value={task.notes || ''}
            onSave={handleNotesSave}
            className={desktopStyles.DetailViewNotesTextarea}
            placeholder={localize('tasks.notes_placeholder', 'Add notes...')}
          />
          <TaskLocationField itemId={task.id} />
          <TaskDateField
            label={localize('tasks.start_date', 'Start Date')}
            placeholder={localize('tasks.start_date_placeholder', 'Select start date')}
            icon={<ScheduledIcon />}
            date={task.startDate}
            onDateClick={handleStartDateClick}
          />
          <TaskDateField
            label={localize('tasks.due_date', 'Due Date')}
            placeholder={localize('tasks.due_date_placeholder', 'Select due date')}
            icon={<DueIcon />}
            date={task.dueDate}
            onDateClick={handleDueDateClick}
            isDue={true}
          />
          <TagsField itemId={task.id} />
          <RemindersField
            label={localize('tasks.reminders', 'Reminders')}
            reminders={task.reminders}
            itemId={task.id}
          />
          <RecurringRuleField recurringRule={task.recurringRule} taskId={task.id} />
          <div className={desktopStyles.DetailViewDivider} />
          <SubtaskList task={task} />
        </div>
      </div>

      {onClearSelection && <ClearSelectionButton onClearSelection={onClearSelection} />}
    </div>
  );
};
