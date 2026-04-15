import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { CloseIcon, FlagIcon, MenuIcon, ScheduledIcon } from '@/components/icons';
import { EditableInput } from '@/components/edit/EditableInput.tsx';
import { taskTitleInputKey } from '@/components/edit/inputKeys.ts';
import { TaskInfo } from '@/core/state/type.ts';
import { TaskStatusBox } from '@/desktop/components/todo/TaskStatusBox';
import { useTaskMenu } from '@/desktop/hooks/useTaskMenu.ts';
import { desktopStyles } from '@/desktop/theme/main.ts';
import { localize } from '@/nls';
import { TestIds } from '@/testIds';
import React from 'react';
import { TagsField } from '../TagsField';
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
  const { openTaskMenu } = useTaskMenu(task.id);
  const { handleStartDateClick, handleDueDateClick } = useDatePickerHandlers({
    task,
  });
  const completedSubtaskCount = task.children.filter((subtask) => subtask.status === 'completed').length;
  const subtaskProgress = task.children.length === 0 ? 0 : (completedSubtaskCount / task.children.length) * 100;

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
        <div className={desktopStyles.DetailViewHeaderStatusIcon}>
          <TaskStatusBox status={task.status} className={desktopStyles.DetailViewHeaderStatusBox} />
        </div>
        <EditableInput
          inputKey={taskTitleInputKey(task.id)}
          defaultValue={task.title}
          placeholder={localize('tasks.title_placeholder', 'Add title...')}
          onSave={handleTitleSave}
          className={desktopStyles.DetailViewHeaderTitle}
        />
        <div className={desktopStyles.DetailViewHeaderActions}>
          <button
            data-test-id={TestIds.TaskDetail.MenuButton}
            onClick={handleMenuClick}
            className={desktopStyles.DetailViewHeaderMenuButton}
          >
            <MenuIcon className={desktopStyles.DetailViewHeaderMenuIcon} />
          </button>
          {onClearSelection && (
            <button onClick={onClearSelection} className={desktopStyles.DetailViewHeaderMenuButton}>
              <CloseIcon className={desktopStyles.DetailViewHeaderMenuIcon} />
            </button>
          )}
        </div>
      </div>
      <div className={desktopStyles.DetailViewContent}>
        <div className={desktopStyles.DetailViewContentInner}>
          <NotesField
            value={task.notes || ''}
            onSave={handleNotesSave}
            className={desktopStyles.DetailViewNotesTextarea}
            placeholder={localize('desktop.task_detail.notes_placeholder', 'Add notes...')}
            disableMarkdownRender
          />
          <div className={desktopStyles.DetailViewDivider} />
          <TaskLocationField itemId={task.id} />
          <TaskDateField
            label={localize('desktop.task_detail.start_date', 'Start Date')}
            placeholder={localize('desktop.task_detail.unset', 'Not set')}
            icon={<ScheduledIcon />}
            date={task.startDate}
            onDateClick={handleStartDateClick}
            testId={TestIds.TaskDetail.StartDateField}
          />
          <TaskDateField
            label={localize('desktop.task_detail.due_date', 'Due Date')}
            placeholder={localize('desktop.task_detail.unset', 'Not set')}
            icon={<FlagIcon />}
            date={task.dueDate}
            onDateClick={handleDueDateClick}
            isDue={true}
            testId={TestIds.TaskDetail.DueDateField}
          />
          <RemindersField reminders={task.reminders} itemId={task.id} />
          <TagsField itemId={task.id} />
          <RecurringRuleField
            recurringRule={task.recurringRule}
            taskId={task.id}
            taskStartDate={task.startDate}
            taskDueDate={task.dueDate}
            testId={TestIds.TaskDetail.RecurringRuleField}
          />
          <div className={desktopStyles.DetailViewSubtaskHeader}>
            <span className={desktopStyles.DetailViewSubtaskHeaderTitle}>
              {localize('desktop.task_detail.subtasks', 'Subtasks')}
            </span>
            <span
              className={desktopStyles.DetailViewSubtaskHeaderCount}
            >{`${completedSubtaskCount} / ${task.children.length}`}</span>
          </div>
          <div className={desktopStyles.DetailViewSubtaskProgressBar}>
            <div className={desktopStyles.DetailViewSubtaskProgressFill} style={{ width: `${subtaskProgress}%` }} />
          </div>
          <SubtaskList task={task} />
        </div>
      </div>
    </div>
  );
};
