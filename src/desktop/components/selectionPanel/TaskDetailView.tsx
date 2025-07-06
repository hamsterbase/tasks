import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { EditableTextArea } from '@/components/edit/EditableTextArea.tsx';
import { taskNotesInputKey, taskTitleInputKey } from '@/components/edit/inputKeys.ts';
import { DueIcon, MenuIcon, NoteIcon, ScheduledIcon, TagIcon } from '@/components/icons';
import { TaskInfo } from '@/core/state/type.ts';
import { useTaskMenu } from '@/desktop/hooks/useTaskMenu.ts';
import { localize } from '@/nls';
import React from 'react';
import { ClearSelectionButton } from './ClearSelectionButton';
import { SubtaskList } from './SubtaskList';
import { TaskDateField } from './components/TaskDateField';
import { useDatePickerHandlers } from './hooks/useDatePickerHandlers';

interface TaskDetailViewProps {
  task: TaskInfo;
  onClearSelection?: () => void;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task, onClearSelection }) => {
  const taskItemActions = useTaskItemActions(task);
  const { openTaskMenu } = useTaskMenu(task.id);
  const { handleStartDateClick, handleDueDateClick, handleClearStartDate, handleClearDueDate } = 
    useDatePickerHandlers({ task });

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
    <div className="h-full flex flex-col bg-bg1">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line-light">
        <EditableTextArea
          inputKey={taskTitleInputKey(task.id)}
          defaultValue={task.title}
          placeholder={localize('tasks.title_placeholder', 'Add title...')}
          onSave={handleTitleSave}
          className="flex-1 text-xl font-medium outline-none"
          autoSize={{ minRows: 1 }}
        />
        <div className="flex items-center gap-2">
          <button onClick={handleMenuClick} className="p-1.5 hover:bg-bg3 rounded-md transition-colors">
            <MenuIcon className="size-4 text-t2" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-t2">
              <NoteIcon className="size-4" />
              <span className="text-sm font-medium">{localize('tasks.notes', 'Notes')}</span>
            </div>
            <EditableTextArea
              inputKey={taskNotesInputKey(task.id)}
              defaultValue={task.notes || ''}
              onSave={handleNotesSave}
              className="w-full p-3 bg-bg2 rounded-md outline-none resize-none"
              placeholder={localize('tasks.notes_placeholder', 'Add notes...')}
              autoSize={{ minRows: 1 }}
            />
          </div>

          <div>
            <TaskDateField
              label={localize('tasks.start_date', 'Start Date')}
              icon={<ScheduledIcon className="size-4" />}
              date={task.startDate}
              onDateClick={handleStartDateClick}
              onClearDate={handleClearStartDate}
            />

            <TaskDateField
              label={localize('tasks.due_date', 'Due Date')}
              icon={<DueIcon className="size-4" />}
              date={task.dueDate}
              onDateClick={handleDueDateClick}
              onClearDate={handleClearDueDate}
              isDue={true}
            />

            <div className="flex items-center justify-between py-2 gap-3">
              <div className="flex items-center gap-2 text-t2">
                <TagIcon className="size-4" />
                <span className="text-sm">{localize('tasks.tags', 'Tags')}</span>
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                {task.tags.length > 0 ? (
                  task.tags.map((tag) => (
                    <span key={tag} className="text-brand rounded-md text-xs font-medium">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-t3">-</span>
                )}
              </div>
            </div>
            <SubtaskList task={task} />
          </div>
        </div>
      </div>
      
      {onClearSelection && <ClearSelectionButton onClearSelection={onClearSelection} />}
    </div>
  );
};
