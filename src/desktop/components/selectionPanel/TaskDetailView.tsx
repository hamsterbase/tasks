import { useTaskItemActions } from '@/base/hooks/useTaskItemActions';
import { EditableTextArea } from '@/components/edit/EditableTextArea.tsx';
import { taskNotesInputKey, taskTitleInputKey } from '@/components/edit/inputKeys.ts';
import { DueIcon, MenuIcon, NoteIcon, ScheduledIcon, TagIcon } from '@/components/icons';
import { TaskInfo } from '@/core/state/type.ts';
import { formatDate } from '@/core/time/formatDate';
import { formatRemainingDays } from '@/core/time/formatRemainingDays';
import { isPastOrToday } from '@/core/time/isPast';
import { useDatepicker } from '@/desktop/overlay/datePicker/useDatepicker';
import { useTaskMenu } from '@/desktop/hooks/useTaskMenu.ts';
import { localize } from '@/nls';
import classNames from 'classnames';
import React from 'react';
import { SubtaskList } from './SubtaskList';

interface TaskDetailViewProps {
  task: TaskInfo;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task }) => {
  const showDatePicker = useDatepicker();
  const taskItemActions = useTaskItemActions(task);
  const { openTaskMenu } = useTaskMenu(task.id);

  const handleTitleSave = (value: string) => {
    taskItemActions.updateTaskTitle(value);
  };

  const handleNotesSave = (value: string) => {
    taskItemActions.updateTaskNotes(value);
  };

  const handleStartDateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left - 280 - 10, // 280px is the width of datepicker, 10px gap
      y: rect.top,
    };
    showDatePicker(
      task.startDate,
      (selectedDate) => {
        taskItemActions.updateStartDate(selectedDate);
      },
      position
    );
  };

  const handleDueDateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left - 280 - 10, // 280px is the width of datepicker, 10px gap
      y: rect.top,
    };
    showDatePicker(
      task.dueDate,
      (selectedDate) => {
        taskItemActions.updateDueDate(selectedDate);
      },
      position
    );
  };

  const handleClearStartDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    taskItemActions.clearStartDate();
  };

  const handleClearDueDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    taskItemActions.clearDueDate();
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
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-t2">
                <ScheduledIcon className="size-4" />
                <span className="text-sm">{localize('tasks.start_date', 'Start Date')}</span>
              </div>
              <div className="flex items-center gap-1">
                {task.startDate ? (
                  <div className="flex items-baseline gap-2">
                    <button
                      onClick={handleStartDateClick}
                      className="text-sm text-t1 hover:bg-bg2 px-2 py-1 rounded transition-colors"
                    >
                      {formatDate(task.startDate)}
                    </button>
                    <span className="text-xs text-t2">{formatRemainingDays(task.startDate)}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleStartDateClick}
                    className="text-sm text-t1 hover:bg-bg2 px-2 py-1 rounded transition-colors"
                  >
                    {localize('tasks.set_date', 'Set date')}
                  </button>
                )}
                {task.startDate && (
                  <button
                    onClick={handleClearStartDate}
                    className="text-xs text-t3 hover:text-t1 px-1 transition-colors"
                    title={localize('tasks.clear_date', 'Clear date')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-t2">
                <DueIcon className="size-4" />
                <span className="text-sm">{localize('tasks.due_date', 'Due Date')}</span>
              </div>
              <div className="flex items-center gap-1">
                {task.dueDate ? (
                  <div className="flex items-baseline gap-2">
                    <button
                      onClick={handleDueDateClick}
                      className={classNames('text-sm hover:bg-bg2 px-2 py-1 rounded transition-colors', {
                        'text-stress-red': isPastOrToday(task.dueDate),
                        'text-t1': !isPastOrToday(task.dueDate),
                      })}
                    >
                      {formatDate(task.dueDate)}
                    </button>
                    <span className="text-xs text-t2">{formatRemainingDays(task.dueDate)}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleDueDateClick}
                    className="text-sm text-t1 hover:bg-bg2 px-2 py-1 rounded transition-colors"
                  >
                    {localize('tasks.set_date', 'Set date')}
                  </button>
                )}
                {task.dueDate && (
                  <button
                    onClick={handleClearDueDate}
                    className="text-xs text-t3 hover:text-t1 px-1 transition-colors"
                    title={localize('tasks.clear_date', 'Clear date')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

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
    </div>
  );
};
