import { getProject } from '@/core/state/getProject.ts';
import { getProjectHeadingInfo } from '@/core/state/getProjectHeadingInfo.ts';
import { getTaskInfo } from '@/core/state/getTaskInfo.ts';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { CreateIcon } from '@/mobile/components/dnd/CreateIcon.tsx';
import { HomeProjectItem } from '@/mobile/components/todo/HomeProjectItem.tsx';
import { TaskItem } from '@/mobile/components/todo/TaskItem.tsx';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { DragDropElements } from '@/utils/dnd/dragDropCollision.ts';
import { DragOverlay, useDndContext } from '@dnd-kit/core';
import type { TreeID } from 'loro-crdt';
import React, { useMemo } from 'react';
import { AreaHeader } from '../todo/AreaHeader.tsx';
import { ProjectHeadingItem } from '../todo/ProjectHeadingItem.tsx';
import { getArea } from '@/core/state/getAreaState.ts';
import classNames from 'classnames';
import { styles } from '@/mobile/theme.ts';
import { SubtaskItem } from '../todo/SubtaskItem.tsx';

export interface DragOverlayItemProps {
  className?: string;
  isSubtask?: boolean;
  textProps?: {
    hideProjectTitle?: boolean;
    hideStartDate?: boolean;
  };
  projectProps?: {
    hideSubtitle?: boolean;
    hideStartDate?: boolean;
    hideNavIcon?: boolean;
  };
}

export const OverlayItem: React.FC<DragOverlayItemProps> = ({ textProps, projectProps, isSubtask, className }) => {
  const { active } = useDndContext();
  const activeId = active?.id;
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const modelState = todoService.modelState;
  const overLay = useMemo(() => {
    if (!activeId) return null;
    if (activeId === DragDropElements.create) {
      return <CreateIcon onClick={() => {}} />;
    }
    const task = modelState.taskObjectMap.get(activeId as TreeID);
    if (!task) return null;
    switch (task.type) {
      case 'task': {
        if (isSubtask) {
          return (
            <SubtaskItem
              key={task.id}
              id={task.id}
              title={task.title}
              status={task.status}
              onStatusChange={() => {}}
              onTitleChange={() => {}}
              onCreate={() => {}}
              onDelete={() => {}}
            />
          );
        }
        return <TaskItem taskInfo={getTaskInfo(modelState, activeId as TreeID)} {...(textProps ?? {})} />;
      }
      case 'projectHeading':
        return <ProjectHeadingItem projectHeadingInfo={getProjectHeadingInfo(modelState, activeId as TreeID)} />;
      case 'area':
        return <AreaHeader areaInfo={getArea(modelState, activeId as TreeID)!} />;
      case 'project':
        return <HomeProjectItem projectInfo={getProject(modelState, activeId as TreeID)} {...(projectProps ?? {})} />;
    }
  }, [activeId, modelState, textProps, projectProps, isSubtask]);

  return (
    <DragOverlay>
      <div
        className={classNames(
          styles.taskItemOverlayBackground,
          styles.taskItemOverlayRound,
          styles.taskItemOverlayShadow,
          className
        )}
      >
        {overLay}
      </div>
    </DragOverlay>
  );
};
