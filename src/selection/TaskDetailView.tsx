import { EditableTextArea } from '@/components/edit/EditableTextArea';
import { taskNotesInputKey, taskTitleInputKey } from '@/components/edit/inputKeys';
import { DueIcon, NoteIcon, ScheduledIcon, SubtaskIcon, TagIcon } from '@/components/icons';
import { MenuIcon } from '@/components/icons/index.ts';
import { TaskInfo } from '@/core/state/type';
import { formatDueDateInList } from '@/core/time/formatDueDateInList';
import { UpdateTaskSchema } from '@/core/type';
import { TaskStatusBox } from '@/mobile/components/taskItem/TaskStatusBox';
import { localize } from '@/nls';
import classNames from 'classnames';
import dayjs from 'dayjs';
import TextArea from 'rc-textarea';
import React from 'react';

interface TaskDetailViewProps {
  task: TaskInfo;
  onUpdate: (updates: UpdateTaskSchema) => void;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task, onUpdate }) => {
  const handleTitleSave = (value: string) => {
    onUpdate({ title: value });
  };

  const handleNotesSave = (value: string) => {
    onUpdate({ notes: value });
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
          <button className="p-1.5 hover:bg-bg3 rounded-md transition-colors" title={localize('common.close', 'Close')}>
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
              <div className="text-sm text-t1">
                {task.startDate ? dayjs(task.startDate).format('MMM DD, YYYY') : '-'}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-t2">
                <DueIcon className="size-4" />
                <span className="text-sm">{localize('tasks.due_date', 'Due Date')}</span>
              </div>
              <div className="text-sm text-t1">{task.dueDate ? formatDueDateInList(task.dueDate) : '-'}</div>
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
            {task.children && task.children.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-t2 mb-2">
                  <SubtaskIcon className="size-4" />
                  <span className="text-sm">{localize('tasks.subtasks', 'Subtasks')}</span>
                  <span className="text-xs text-t3">({task.children.length})</span>
                </div>
                <div className="space-y-1">
                  {task.children.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 rounded-md hover:bg-bg3 px-1">
                      <div className="size-4">
                        <TaskStatusBox status={subtask.status} className="text-t3" />
                      </div>
                      <TextArea
                        value={subtask.title}
                        placeholder={localize('tasks.untitled', 'New Task')}
                        className={classNames('text-sm bg-transparent outline-none flex-1', {
                          'line-through': subtask.status === 'canceled',
                          'text-t3': subtask.status === 'completed',
                        })}
                        autoSize={{ minRows: 1 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
