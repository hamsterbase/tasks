import { EditableTextArea } from '@/components/edit/EditableTextArea.tsx';
import { projectTitleInputKey } from '@/components/edit/inputKeys.ts';
import { DueIcon, MenuIcon, ScheduledIcon } from '@/components/icons';
import { getProject } from '@/core/state/getProject';
import { useDatepicker } from '@/desktop/overlay/datePicker/useDatepicker';
import { desktopStyles } from '@/desktop/theme/main.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { useParams } from 'react-router';
import { TagsField } from '../../TagsField';
import { NotesField } from '../components/NotesField';
import { TaskDateField } from '../components/TaskDateField';
import { TaskLocationField } from '../components/TaskLocationField';
import { useDesktopProjectMenu } from './useDesktopProjectMenu';

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
    onDateSelect: (date: number | undefined | null) => void,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left,
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

  const handleMenuClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = _e.currentTarget.getBoundingClientRect();
    openDesktopProjectMenu(rect.right, rect.bottom);
  };

  return (
    <div className={desktopStyles.DetailViewContainer}>
      <div className={desktopStyles.DetailViewHeader}>
        <EditableTextArea
          inputKey={projectTitleInputKey(projectId)}
          defaultValue={project.title}
          placeholder={localize('project.untitled', 'New Project')}
          onSave={handleTitleSave}
          enableEnterToSave
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
            value={project.notes || ''}
            onSave={handleNotesSave}
            className={desktopStyles.DetailViewNotesTextarea}
          />
          <TaskLocationField itemId={projectId} />
          <TaskDateField
            label={localize('project.start_date', 'Start Date')}
            icon={<ScheduledIcon />}
            date={project.startDate}
            onDateClick={handleStartDateClick}
            placeholder={localize('project.start_date_placeholder', 'Select start date')}
          />

          <TaskDateField
            label={localize('project.due_date', 'Due Date')}
            icon={<DueIcon />}
            date={project.dueDate}
            onDateClick={handleDueDateClick}
            placeholder={localize('project.due_date_placeholder', 'Select due date')}
            isDue={true}
          />
          <TagsField itemId={projectId} />
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
