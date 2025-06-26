import { TaskList } from '@/components/taskList/taskList';
import { getTaskInfo } from '@/core/state/getTaskInfo.ts';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { DragOverlay, useDndContext } from '@dnd-kit/core';
import classNames from 'classnames';
import type { TreeID } from 'loro-crdt';
import React, { useMemo } from 'react';
import { SubtaskItem } from '../taskListItem/SubtaskItem';
import { TaskListItem } from '../taskListItem/TaskListItem';

export interface DragOverlayItemProps {
  isSubtask?: boolean;
}

export const DragOverlayItem: React.FC<DragOverlayItemProps> = ({ isSubtask }) => {
  const { active } = useDndContext();
  const activeId = active?.id;
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const modelState = todoService.modelState;

  const overlayContent = useMemo(() => {
    if (!activeId) return null;

    const task = modelState.taskObjectMap.get(activeId as TreeID);
    if (!task) return null;

    const emptyTaskList = new TaskList('Inbox', [], [], null, null);

    switch (task.type) {
      case 'task': {
        if (isSubtask) {
          const taskInfo = getTaskInfo(modelState, activeId as TreeID);
          return <SubtaskItem subtask={taskInfo} subList={emptyTaskList} />;
        } else {
          const taskInfo = getTaskInfo(modelState, activeId as TreeID);
          return <TaskListItem task={taskInfo} willDisappear={false} taskList={emptyTaskList} />;
        }
      }
      case 'projectHeading':
        return null;
      case 'area':
        return null;
      case 'project':
        return null;
      default:
        return null;
    }
  }, [activeId, modelState, isSubtask]);

  return (
    <DragOverlay>
      <div className={classNames('inset-shadow-sm shadow-sm bg-bg1')}>{overlayContent}</div>
    </DragOverlay>
  );
};
