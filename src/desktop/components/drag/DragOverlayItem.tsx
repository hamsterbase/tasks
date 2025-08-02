import { TaskList } from '@/components/taskList/taskList';
import { getArea } from '@/core/state/getAreaState.ts';
import { getProject } from '@/core/state/getProject.ts';
import { getProjectHeadingInfo } from '@/core/state/getProjectHeadingInfo.ts';
import { getTaskInfo } from '@/core/state/getTaskInfo.ts';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { DragOverlay, useDndContext } from '@dnd-kit/core';
import type { TreeID } from 'loro-crdt';
import React, { useMemo } from 'react';
import { SidebarAreaItem } from '../sidebar/SidebarAreaItem';
import { SidebarProjectItem } from '../sidebar/SidebarProjectItem';
import { SubtaskItem } from '../taskListItem/SubtaskItem';
import { TaskListItem } from '../taskListItem/TaskListItem';
import { DesktopHeadingListItem } from '../desktopHeadingListItem/desktopHeadingListItem';
import { DesktopProjectListItem } from '../todo/DesktopProjectListItem';

interface TaskProps {
  hideProjectTitle: boolean;
}

export interface DragOverlayItemProps {
  isSubtask?: boolean;
  taskProps?: TaskProps;
  projectVariant?: 'sidebar' | 'desktop';
}

export const DragOverlayItem: React.FC<DragOverlayItemProps> = ({
  isSubtask,
  taskProps,
  projectVariant = 'sidebar',
}) => {
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
          return (
            <TaskListItem
              task={taskInfo}
              willDisappear={false}
              taskList={emptyTaskList}
              hideProjectTitle={taskProps?.hideProjectTitle}
            />
          );
        }
      }
      case 'projectHeading': {
        const projectHeadingInfo = getProjectHeadingInfo(modelState, activeId as TreeID);
        return <DesktopHeadingListItem projectHeadingInfo={projectHeadingInfo} />;
      }
      case 'area': {
        const areaInfo = getArea(modelState, activeId as TreeID);
        return areaInfo ? <SidebarAreaItem areaInfo={areaInfo} /> : null;
      }
      case 'project': {
        const projectInfo = getProject(modelState, activeId as string);
        return projectVariant === 'desktop' ? (
          <DesktopProjectListItem project={projectInfo} />
        ) : (
          <SidebarProjectItem projectInfo={projectInfo} />
        );
      }
      default:
        return null;
    }
  }, [activeId, modelState, isSubtask, taskProps, projectVariant]);

  return (
    <DragOverlay>
      <div>{overlayContent}</div>
    </DragOverlay>
  );
};
