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
        return {
          icon: <AreaIcon className={desktopStyles.CommandPaletteResultItemParentIconSvg} />,
          title: display.title,
        };
      }
      return {
        icon: <ProjectIcon status={display.icon.status} progress={display.icon.progress} size="xs" />,
        title: display.title,
      };
    }
    if (item.type === 'task') {
      return {
        icon: <InboxIcon className={desktopStyles.CommandPaletteResultItemParentIconSvg} />,
        title: localize('inbox.title', 'Inbox'),
      };
    }
    return null;
  })();

  const renderIcon = () => {
    switch (item.type) {
      case 'area':
        return <AreaIcon className={desktopStyles.CommandPaletteResultItemIconSvg} />;

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

      <div className={desktopStyles.CommandPaletteResultItemContent}>
        <span className={desktopStyles.CommandPaletteResultItemTitle}>{getTitle()}</span>

        {parentInfo && (
          <div className={desktopStyles.CommandPaletteResultItemParent}>
            <span className={desktopStyles.CommandPaletteResultItemParentIcon}>{parentInfo.icon}</span>
            <span className={desktopStyles.CommandPaletteResultItemParentTitle}>{parentInfo.title}</span>
          </div>
        )}
      </div>
    </div>
  );
};
