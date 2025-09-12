import { AreaIcon, MoveIcon } from '@/components/icons';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { getParentDisplay } from '@/core/state/getParentDisplay';
import { useTreeSelect } from '@/desktop/overlay/treeSelect/useTreeSelect';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { TreeID } from 'loro-crdt';
import React from 'react';

interface TaskLocationFieldProps {
  itemId: TreeID;
}

export const TaskLocationField: React.FC<TaskLocationFieldProps> = ({ itemId }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const treeSelect = useTreeSelect();

  const handleMoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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
      <button className={desktopStyles.SelectionFieldButton} onClick={handleMoveClick}>
        <MoveIcon className={desktopStyles.SelectionFieldIcon} />
        <span className={desktopStyles.SelectionFieldPlaceholderText}>
          {localize('tasks.location.move', 'Move to')}
        </span>
      </button>
    );
  }

  return (
    <button className={desktopStyles.SelectionFieldButton} onClick={handleMoveClick}>
      {parentDisplayData.icon.type === 'area' ? (
        <AreaIcon className={`${desktopStyles.SelectionFieldIcon}`} />
      ) : (
        <ProjectStatusBox
          progress={parentDisplayData.icon.progress}
          status={parentDisplayData.icon.status}
          color="t2"
          className={desktopStyles.SelectionFieldIcon}
        />
      )}
      <span className={desktopStyles.TaskLocationFieldLocationText}>{parentDisplayData.title}</span>
    </button>
  );
};
