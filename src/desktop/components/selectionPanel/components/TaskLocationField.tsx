import { AreaIcon, MoveIcon, CloseIcon } from '@/components/icons';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { getParentDisplay } from '@/core/state/getParentDisplay';
import { useTreeSelect } from '@/desktop/overlay/treeSelect/useTreeSelect';
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
    treeSelect(rect.right, rect.bottom + 4, {
      currentItemId: itemId,
      onConfirm: (id: TreeID) => {
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
  };

  const parentDisplayData = getParentDisplay(todoService.modelState, itemId);
  return (
    <div className="flex items-center justify-between py-2 gap-2">
      <div className="flex items-center gap-2 text-t2">
        <MoveIcon className="size-4" />
        <span className="text-sm font-medium">{localize('tasks.location', 'Location')}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleMoveClick}
          className="flex items-center gap-2 px-2 py-1 hover:bg-bg3 rounded-md transition-colors max-w-[200px]"
        >
          {parentDisplayData ? (
            <>
              <span className="shrink-0">
                {parentDisplayData.icon.type === 'area' ? (
                  <AreaIcon className="size-5 shrink-0 text-t3" />
                ) : (
                  <ProjectStatusBox
                    progress={parentDisplayData.icon.progress}
                    status={parentDisplayData.icon.status}
                    color="t3"
                    className="size-5 shrink-0"
                  />
                )}
              </span>
              <span className="text-sm text-t1 truncate">{parentDisplayData.title}</span>
            </>
          ) : (
            <span className="text-sm text-t3">{localize('tasks.location.null', 'Set Location')}</span>
          )}
        </button>
        {parentDisplayData && (
          <button onClick={handleClearClick} className="p-1 hover:bg-bg3 rounded-md transition-colors">
            <CloseIcon className="size-4 text-t3" />
          </button>
        )}
      </div>
    </div>
  );
};
