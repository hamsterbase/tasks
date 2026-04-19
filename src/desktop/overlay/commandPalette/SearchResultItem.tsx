import React from 'react';
import { TaskObjectSchema } from '@/core/type';
import { AreaIcon, InboxIcon } from '@/components/icons';
import { TaskIcon } from '@/desktop/components/todo/TaskIcon';
import { ProjectIcon } from '@/desktop/components/todo/ProjectIcon';
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

interface ParentInfo {
  icon: React.ReactNode;
  title: string;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ item, isSelected, onMouseDown }) => {
  const todoService = useService(ITodoService);

  const projectInfo = item.type === 'project' ? getProject(todoService.modelState, item.id) : null;

  const parentInfo = ((): ParentInfo | null => {
    if (item.type === 'area') return null;
    const display = getParentDisplay(todoService.modelState, item.id);
    if (display) {
      if (display.icon.type === 'area') {
        return { icon: <AreaIcon className="size-3" />, title: display.title };
      }
      return {
        icon: <ProjectIcon status={display.icon.status} progress={display.icon.progress} size="xs" />,
        title: display.title,
      };
    }
    if (item.type === 'task') {
      return {
        icon: <InboxIcon className="size-3" />,
        title: localize('inbox.title', 'Inbox'),
      };
    }
    return null;
  })();

  const renderIcon = () => {
    switch (item.type) {
      case 'area':
        return <AreaIcon className="size-4" />;

      case 'project':
        return <ProjectIcon status={item.status} progress={projectInfo?.progress || 0} size="md" />;

      case 'task':
        return <TaskIcon status={item.status} />;
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
      <div className={desktopStyles.CommandPaletteResultItemIcon}>{renderIcon()}</div>

      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
        <span className={desktopStyles.CommandPaletteResultItemTitle}>{getTitle()}</span>

        {parentInfo && (
          <div className="flex items-center gap-1 text-xs text-t3 leading-4 min-w-0">
            <span className="size-3 text-t3 flex-shrink-0 flex items-center justify-center">{parentInfo.icon}</span>
            <span className="truncate min-w-0">{parentInfo.title}</span>
          </div>
        )}
      </div>
    </div>
  );
};
