import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { CloseIcon, FlagIcon, MenuIcon, ScheduledIcon } from '@/components/icons';
import { taskTitleInputKey } from '@/components/edit/inputKeys.ts';
import { TaskInfo } from '@/core/state/type.ts';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { TaskIcon } from '@/desktop/components/todo/TaskIcon';
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

  const headerActions = [
    {
      icon: <MenuIcon />,
      handleClick: handleMenuClick,
      title: localize('common.more', 'More'),
      testId: TestIds.TaskDetail.MenuButton,
    },
    ...(onClearSelection
      ? [
          {
            icon: <CloseIcon />,
            handleClick: () => onClearSelection(),
            title: localize('common.close', 'Close'),
          },
        ]
      : []),
  ];

  return (
    <div className={desktopStyles.DetailViewContainer}>
      <EntityHeader
        editable
        disableNewLine
        variant="detail"
        inputKey={taskTitleInputKey(task.id)}
        renderIcon={() => <TaskIcon status={task.status} className={desktopStyles.DetailViewHeaderStatusIconColor} />}
        title={task.title}
        placeholder={localize('tasks.title_placeholder', 'Add title...')}
        onSave={handleTitleSave}
        extraActions={headerActions}
      />
      <div className={desktopStyles.DetailViewContent}>
        <div className={desktopStyles.DetailViewContentInner}>
          <NotesField
            value={task.notes || ''}
            onSave={handleNotesSave}
            className={desktopStyles.DetailViewNotesTextarea}
            placeholder={localize('desktop.task_detail.notes_placeholder', 'Add notes...')}
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
