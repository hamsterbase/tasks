import { EditableTextArea } from '@/components/edit/EditableTextArea.tsx';
import { projectHeadingTitleInputKey } from '@/components/edit/inputKeys.ts';
import { CloseIcon, HashIcon, MenuIcon } from '@/components/icons';
import { ProjectHeadingInfo } from '@/core/state/type.ts';
import { useDesktopProjectHeader } from '@/desktop/hooks/useDesktopProjectHeader';
import { useService } from '@/hooks/use-service.ts';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { TestIds } from '@/testIds';
import React from 'react';
import { TaskLocationField } from './components/TaskLocationField';
import { desktopStyles } from '@/desktop/theme/main';

interface HeadingDetailViewProps {
  heading: ProjectHeadingInfo;
  onClearSelection?: () => void;
}

const ICON_STROKE_WIDTH = 1.5;

export const HeadingDetailView: React.FC<HeadingDetailViewProps> = ({ heading, onClearSelection }) => {
  const todoService = useService(ITodoService);
  const completedTaskCount = heading.tasks.filter((task) => task.status === 'completed').length;
  const taskProgress = heading.tasks.length === 0 ? 0 : (completedTaskCount / heading.tasks.length) * 100;

  const handleTitleSave = (value: string) => {
    todoService.updateProjectHeading(heading.id, { title: value });
  };

  const { handleMenuClick } = useDesktopProjectHeader({ projectHeadingInfo: heading });

  return (
    <div className={desktopStyles.DetailViewContainer}>
      <div className={desktopStyles.DetailViewHeader}>
        <div className={desktopStyles.DetailViewHeaderStatusIcon}>
          <HashIcon className={desktopStyles.DetailViewHeaderStatusBox} strokeWidth={ICON_STROKE_WIDTH} />
        </div>
        <EditableTextArea
          inputKey={projectHeadingTitleInputKey(heading.id)}
          defaultValue={heading.title}
          placeholder={localize('heading.title_placeholder', 'Add heading title...')}
          onSave={handleTitleSave}
          className={desktopStyles.DetailViewHeaderTitle}
          autoSize={{ minRows: 1 }}
        />
        <div className={desktopStyles.DetailViewHeaderActions}>
          <button
            onClick={handleMenuClick}
            className={desktopStyles.DetailViewHeaderMenuButton}
            data-test-id={TestIds.HeadingDetail.MenuButton}
          >
            <MenuIcon className={desktopStyles.DetailViewHeaderMenuIcon} strokeWidth={ICON_STROKE_WIDTH} />
          </button>
          {onClearSelection && (
            <button onClick={onClearSelection} className={desktopStyles.DetailViewHeaderMenuButton}>
              <CloseIcon className={desktopStyles.DetailViewHeaderMenuIcon} strokeWidth={ICON_STROKE_WIDTH} />
            </button>
          )}
        </div>
      </div>

      <div className={desktopStyles.DetailViewContent}>
        <div className={desktopStyles.DetailViewContentInner}>
          <TaskLocationField itemId={heading.id} />
          <div className={desktopStyles.DetailViewSubtaskHeader}>
            <span className={desktopStyles.DetailViewSubtaskHeaderTitle}>
              {localize('heading.task_progress', 'Task Progress')}
            </span>
            <span
              className={desktopStyles.DetailViewSubtaskHeaderCount}
            >{`${completedTaskCount} / ${heading.tasks.length}`}</span>
          </div>
          <div className={desktopStyles.DetailViewSubtaskProgressBar}>
            <div className={desktopStyles.DetailViewSubtaskProgressFill} style={{ width: `${taskProgress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
