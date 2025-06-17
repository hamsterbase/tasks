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
import React, { useEffect, useState } from 'react';

interface TaskDetailViewProps {
  task: TaskInfo;
  onUpdate: (updates: UpdateTaskSchema) => void;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task, onUpdate }) => {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');

  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes || '');
  }, [task.id, task.title, task.notes]);

  const handleTitleSave = () => {
    if (title !== task.title) {
      onUpdate({ title });
    }
  };

  const handleNotesSave = () => {
    if (notes !== task.notes) {
      onUpdate({ notes });
    }
  };
  return (
    <div className="h-full flex flex-col bg-bg1">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line-light">
        <TextArea
          value={title}
          autoSize={{ minRows: 1 }}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleSave}
          className="flex-1 text-xl font-medium bg-red outline-none"
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
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesSave}
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
