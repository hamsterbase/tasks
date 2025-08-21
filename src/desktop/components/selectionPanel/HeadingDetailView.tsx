import { EditableTextArea } from '@/components/edit/EditableTextArea.tsx';
import { projectHeadingTitleInputKey } from '@/components/edit/inputKeys.ts';
import { MenuIcon } from '@/components/icons';
import { ProjectHeadingInfo } from '@/core/state/type.ts';
import { useDesktopProjectHeader } from '@/desktop/hooks/useDesktopProjectHeader';
import { useService } from '@/hooks/use-service.ts';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import React from 'react';
import { ClearSelectionButton } from './ClearSelectionButton';
import { TaskLocationField } from './components/TaskLocationField';
import { desktopStyles } from '@/desktop/theme/main';

interface HeadingDetailViewProps {
  heading: ProjectHeadingInfo;
  onClearSelection?: () => void;
}

export const HeadingDetailView: React.FC<HeadingDetailViewProps> = ({ heading, onClearSelection }) => {
  const todoService = useService(ITodoService);

  const handleTitleSave = (value: string) => {
    todoService.updateProjectHeading(heading.id, { title: value });
  };

  const { handleMenuClick } = useDesktopProjectHeader({ projectHeadingInfo: heading });

  return (
    <div className={desktopStyles.DetailViewContainer}>
      <div className={desktopStyles.DetailViewHeader}>
        <EditableTextArea
          inputKey={projectHeadingTitleInputKey(heading.id)}
          defaultValue={heading.title}
          placeholder={localize('heading.title_placeholder', 'Add heading title...')}
          onSave={handleTitleSave}
          className={desktopStyles.DetailViewHeaderTitle}
          autoSize={{ minRows: 1 }}
        />
        <button onClick={handleMenuClick} className={desktopStyles.DetailViewHeaderMenuButton}>
          <MenuIcon className={desktopStyles.DetailViewHeaderMenuIcon} />
        </button>
      </div>

      <div className={desktopStyles.DetailViewContent}>
        <div className={desktopStyles.DetailViewContentInner}>
          <TaskLocationField itemId={heading.id} />
        </div>
      </div>

      {onClearSelection && <ClearSelectionButton onClearSelection={onClearSelection} />}
    </div>
  );
};
