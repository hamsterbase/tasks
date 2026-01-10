import React from 'react';
import { TaskObjectSchema } from '@/core/type';
import { AreaIcon } from '@/components/icons';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { TaskStatusBox } from '@/desktop/components/todo/TaskStatusBox';
import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import { getParentDisplay } from '@/core/state/getParentDisplay';
import { getProject } from '@/core/state/getProject';
import { useService } from '@/hooks/use-service';
import { ITodoService } from '@/services/todo/common/todoService';

interface SearchResultItemProps {
  item: TaskObjectSchema;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ item, isSelected, onMouseDown }) => {
  const todoService = useService(ITodoService);

  // Get parent information
  const parentDisplay = item.type !== 'area' ? getParentDisplay(todoService.modelState, item.id) : null;

  // For projects, get progress information
  const projectInfo = item.type === 'project' ? getProject(todoService.modelState, item.id) : null;

  const renderIcon = () => {
    switch (item.type) {
      case 'area':
        return <AreaIcon className="size-4" />;

      case 'project':
        return (
          <ProjectStatusBox progress={projectInfo?.progress || 0} status={item.status} color="t3" className="size-4" />
        );

      case 'task':
        return <TaskStatusBox status={item.status} className="size-4" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (item.title) {
      return item.title;
    }
    switch (item.type) {
      case 'area':
        return localize('area.untitled', 'New Area');
      case 'project':
        return localize('project.untitled', 'New Project');
      case 'task':
        return localize('task.untitled', 'New Task');
      default:
        return '';
    }
  };

  return (
    <div
      className={`${desktopStyles.CommandPaletteResultItem} ${
        isSelected ? desktopStyles.CommandPaletteResultItemSelected : ''
      }`}
      onMouseDown={onMouseDown}
    >
      {/* Icon */}
      <div className={desktopStyles.CommandPaletteResultItemIcon}>{renderIcon()}</div>

      {/* Content: Title + Parent */}
      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
        {/* Main title */}
        <span className={desktopStyles.CommandPaletteResultItemTitle}>{getTitle()}</span>

        {/* Parent title */}
        {parentDisplay && <span className="text-sm text-t2 truncate leading-5">{parentDisplay.title}</span>}
      </div>
    </div>
  );
};
