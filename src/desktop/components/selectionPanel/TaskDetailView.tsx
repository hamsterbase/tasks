import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { EditableTextArea } from '@/components/edit/EditableTextArea.tsx';
import { taskNotesInputKey, taskTitleInputKey } from '@/components/edit/inputKeys.ts';
import { DueIcon, MenuIcon, ScheduledIcon } from '@/components/icons';
import { TaskInfo } from '@/core/state/type.ts';
import { useTaskMenu } from '@/desktop/hooks/useTaskMenu.ts';
import { localize } from '@/nls';
import React from 'react';
import { TagsField } from '../TagsField';
import { ClearSelectionButton } from './ClearSelectionButton';
import { SubtaskList } from './SubtaskList';
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
    <div className="h-full flex flex-col">
      <div className="min-h-15 flex px-5 py-3.75 gap-5 items-start justify-between border-b border-line-regular">
        <EditableTextArea
          inputKey={taskTitleInputKey(task.id)}
          defaultValue={task.title}
          placeholder={localize('tasks.title_placeholder', 'Add title...')}
          onSave={handleTitleSave}
          className="flex-1 text-xl leading-7.5 font-medium outline-none"
          autoSize={{ minRows: 1 }}
        />
        <button onClick={handleMenuClick} className="size-6 h-7.6 flex items-center">
          <MenuIcon className="size-6 text-t3" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-2">
          <EditableTextArea
            inputKey={taskNotesInputKey(task.id)}
            defaultValue={task.notes || ''}
            onSave={handleNotesSave}
            className="w-full p-3 bg-bg2 rounded-lg outline-none resize-none text-base leading-5 placeholder:text-t3"
            placeholder={localize('tasks.notes_placeholder', 'Add notes...')}
            autoSize={{ minRows: 1 }}
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
          <div className="h-[1px] bg-line-regular"></div>
          <SubtaskList task={task} />
        </div>
      </div>

      {onClearSelection && <ClearSelectionButton onClearSelection={onClearSelection} />}
    </div>
  );
};
