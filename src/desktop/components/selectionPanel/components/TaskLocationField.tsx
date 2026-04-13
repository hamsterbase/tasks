import { AreaIcon } from '@/components/icons';
import { getParentDisplay } from '@/core/state/getParentDisplay';
import { useTreeSelect } from '@/desktop/overlay/treeSelect/useTreeSelect';
import { desktopStyles } from '@/desktop/theme/main';
import { ProjectIcon } from '@/desktop/components/todo/ProjectIcon';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { TreeID } from 'loro-crdt';
import React from 'react';
import { TaskDetailAttributeRow } from './TaskDetailAttributeRow';

interface TaskLocationFieldProps {
  itemId: TreeID;
  label?: string;
  emptyIcon?: React.ReactNode;
}

export const TaskLocationField: React.FC<TaskLocationFieldProps> = ({ itemId, label, emptyIcon }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const treeSelect = useTreeSelect();
  const resolvedLabel = label || localize('tasks.location', 'Location');

  const handleMoveClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    treeSelect(rect.left, rect.top, {
      currentItemId: itemId,
      onConfirm: (id: TreeID | null) => {
        if (!id) {
          handleClearClick();
          return;
        }
        const item = todoService.modelState.taskObjectMap.get(itemId);
        if (!item) return;
        if (item.type === 'task') {
          todoService.updateTask(itemId, { parentId: id });
        }
        if (item.type === 'project') {
          todoService.updateProject(itemId, {
            position: {
              parentId: id,
              type: 'firstElement',
            },
          });
        }
        if (item.type === 'projectHeading') {
          todoService.updateProjectHeading(itemId, {
            position: {
              parentId: id,
              type: 'firstElement',
            },
          });
        }
      },
    });
  };

  const handleClearClick = () => {
    const item = todoService.modelState.taskObjectMap.get(itemId);
    if (!item) return;
    if (item.type === 'task') {
      todoService.updateTask(itemId, { position: { type: 'firstElement', parentId: undefined } });
    }
    if (item.type === 'project') {
      todoService.updateProject(itemId, {
        position: {
          type: 'firstElement',
          parentId: undefined,
        },
      });
    }
    if (item.type === 'projectHeading') {
      todoService.updateProjectHeading(itemId, {
        position: {
          type: 'firstElement',
          parentId: undefined,
        },
      });
    }
  };

  const parentDisplayData = getParentDisplay(todoService.modelState, itemId);

  if (!parentDisplayData) {
    return (
      <TaskDetailAttributeRow
        icon={emptyIcon || <ProjectIcon status="created" progress={0} size="sm" />}
        label={resolvedLabel}
        content={localize('tasks.location.empty', 'Not set')}
        placeholder={true}
        onClick={handleMoveClick}
      />
    );
  }

  return (
    <TaskDetailAttributeRow
      label={resolvedLabel}
      onClick={handleMoveClick}
      icon={
        parentDisplayData.icon.type === 'area' ? (
          <AreaIcon className={desktopStyles.TaskDetailAttributeIcon} />
        ) : (
          <ProjectIcon progress={parentDisplayData.icon.progress} status={parentDisplayData.icon.status} size="sm" />
        )
      }
      content={<span className={desktopStyles.TaskLocationFieldLocationText}>{parentDisplayData.title}</span>}
    />
  );
};
