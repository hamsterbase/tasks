import { EditableTextArea } from '@/components/edit/EditableTextArea.tsx';
import { projectTitleInputKey } from '@/components/edit/inputKeys.ts';
import { DueIcon, MenuIcon, NoteIcon, ScheduledIcon } from '@/components/icons';
import { getProject } from '@/core/state/getProject';
import { useDatepicker } from '@/desktop/overlay/datePicker/useDatepicker';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { useParams } from 'react-router';
import { TaskDateField } from '../components/TaskDateField';
import { useDesktopProjectMenu } from './useDesktopProjectMenu';
import { TaskLocationField } from '../components/TaskLocationField';
import { TagsField } from '../../TagsField';

const useProjectId = (): TreeID | null => {
  const todoService = useService(ITodoService);
  const { projectUid } = useParams<{ projectUid?: string }>();

  if (!projectUid) {
    return null;
  }

  const projectId = todoService.modelState.taskObjectUidMap.get(projectUid)?.id;
  return projectId || null;
};

interface IProjectDetailPanelContentProps {
  projectId: TreeID;
  project: NonNullable<ReturnType<typeof getProject>>;
}

const ProjectDetailPanelContent: React.FC<IProjectDetailPanelContentProps> = ({ projectId, project }) => {
  const todoService = useService(ITodoService);
  const showDatePicker = useDatepicker();

  const handleTitleSave = (title: string) => {
    todoService.updateProject(projectId, { title });
  };

  const handleNotesSave = (notes: string) => {
    todoService.updateProject(projectId, { notes });
  };

  const { openDesktopProjectMenu } = useDesktopProjectMenu(projectId);

  const showDatePickerAtPosition = (
    currentDate: number | undefined,
    onDateSelect: (date: number | undefined) => void,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left - 280 - 10,
      y: rect.top,
    };
    showDatePicker(currentDate, onDateSelect, position);
  };

  const handleStartDateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    showDatePickerAtPosition(
      project.startDate,
      (date) => {
        if (date !== undefined) {
          todoService.updateProject(projectId, { startDate: date });
        }
      },
      e
    );
  };

  const handleDueDateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    showDatePickerAtPosition(
      project.dueDate,
      (date) => {
        if (date !== undefined) {
          todoService.updateProject(projectId, { dueDate: date });
        }
      },
      e
    );
  };

  const handleClearStartDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    todoService.updateProject(projectId, { startDate: null });
  };

  const handleClearDueDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    todoService.updateProject(projectId, { dueDate: null });
  };

  const handleMenuClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = _e.currentTarget.getBoundingClientRect();
    openDesktopProjectMenu(rect.right, rect.bottom);
  };

  return (
    <div className="h-full flex flex-col bg-bg1">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line-light">
        <EditableTextArea
          inputKey={projectTitleInputKey(projectId)}
          defaultValue={project.title}
          placeholder={localize('project.detail.titlePlaceholder', 'Enter project title...')}
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
              <span className="text-sm font-medium">{localize('project.detail.notes', 'Notes')}</span>
            </div>
            <EditableTextArea
              inputKey={`project-${projectId}-notes`}
              defaultValue={project.notes || ''}
              onSave={handleNotesSave}
              className="w-full p-3 bg-bg2 rounded-md outline-none resize-none"
              placeholder={localize('project.detail.notesPlaceholder', 'Enter project notes...')}
              autoSize={{ minRows: 1 }}
            />
          </div>

          <div>
            <TaskLocationField itemId={projectId} />
            <TaskDateField
              label={localize('project.start_date', 'Start Date')}
              icon={<ScheduledIcon className="size-4" />}
              date={project.startDate}
              onDateClick={handleStartDateClick}
              onClearDate={handleClearStartDate}
            />

            <TaskDateField
              label={localize('project.due_date', 'Due Date')}
              icon={<DueIcon className="size-4" />}
              date={project.dueDate}
              onDateClick={handleDueDateClick}
              onClearDate={handleClearDueDate}
              isDue={true}
            />

            <TagsField itemId={projectId} />

            <div className="flex items-center justify-between py-2 gap-3">
              <div className="flex items-center gap-2 text-t2">
                <span className="text-sm">{localize('project.detail.progress', 'Progress')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-t1">
                  {project.completedTasks} / {project.totalTasks}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectDetailPanel: React.FC = () => {
  const todoService = useService(ITodoService);
  const projectId = useProjectId();

  useWatchEvent(todoService.onStateChange);

  if (!projectId) {
    return null;
  }

  let project = null;
  try {
    project = getProject(todoService.modelState, projectId);
  } catch {
    return null;
  }

  if (!project) {
    return null;
  }

  return <ProjectDetailPanelContent projectId={projectId} project={project} />;
};
