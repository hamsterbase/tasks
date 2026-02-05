import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc.ts';
import { MenuIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { getProjectHeadingAndTasks } from '@/core/state/getProjectHeadingAndTasks.ts';
import { getProject } from '@/core/state/getProject';
import { FlattenedItem, FlattenedResult } from '@/core/state/home/flattenedItemsToResult.ts';
import { ProjectHeadingInfo, TaskInfo } from '@/core/state/type';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import useProject from '@/mobile/hooks/useProject.tsx';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { getFlattenedItemsCollisionDetectionStrategy } from '@/utils/dnd/flattenedItemsCollisionDetectionStrategy';
import { getFlattenedItemsDragEndPosition } from '@/utils/dnd/flattenedItemsDragPosition.ts';
import { DragEndEvent, useDndContext } from '@dnd-kit/core';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { useParams } from 'react-router';
import { FABProps } from '../components/FAB.tsx';
import { LastPlacement } from '../components/dnd/lastPlacement.tsx';
import { PageHeaderProps } from '../components/PageHeader.tsx';
import { PageLayout } from '../components/PageLayout.tsx';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper.tsx';
import { ProjectHeadingItem } from '../components/todo/ProjectHeadingItem';
import { TaskItem } from '../components/todo/TaskItem';
import { styles } from '../theme.ts';
import ProjectMeta from './project/ProjectMeta';
import { useTaskDisplaySettingsMobile } from '../hooks/useTaskDisplaySettings.ts';

const Files: React.FC<{
  items: FlattenedItem<ProjectHeadingInfo, TaskInfo>[];
  result: FlattenedResult<ProjectHeadingInfo, TaskInfo>;
  willDisappearObjectIdSet: Set<TreeID>;
}> = ({ items, result, willDisappearObjectIdSet }) => {
  const { active } = useDndContext();
  return (
    <React.Fragment>
      <div>
        {items.map((item) => {
          if (item.type === 'header') {
            return (
              <ProjectHeadingItem
                key={item.id}
                projectHeadingInfo={item.content}
                className={classNames(styles.taskItemGroupBackground, {
                  [styles.taskItemGroupTopRound]: result.borderTop(item.id),
                  [styles.taskItemGroupBottomRound]: result.borderBottom(item.id),
                })}
              />
            );
          }
          if (item.type === 'item') {
            if (active?.id && active?.id === item.headerId) {
              return null;
            }
            return (
              <TaskItemWrapper key={item.id} willDisappear={willDisappearObjectIdSet.has(item.id)} id={item.id}>
                <TaskItem
                  key={item.id}
                  taskInfo={item.content}
                  hideProjectTitle={true}
                  followParentArchiveState
                  className={classNames(styles.taskItemGroupBackground, {
                    [styles.taskItemGroupTopRound]: result.borderTop(item.id),
                    [styles.taskItemGroupBottomRound]: result.borderBottom(item.id),
                  })}
                />
              </TaskItemWrapper>
            );
          }
          return null;
        })}
      </div>
      <LastPlacement />
    </React.Fragment>
  );
};

const useProjectId = (): string => {
  const { projectUid } = useParams<{ projectUid?: string }>();
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  if (!projectUid) {
    return '';
  }
  const projectId = todoService.modelState.taskObjectUidMap.get(projectUid)?.id;
  if (!projectId) {
    return '';
  }
  return projectId;
};

export const ProjectPage = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const projectId = useProjectId();
  let project = null;
  try {
    if (projectId) {
      project = getProject(todoService.modelState, projectId);
    }
  } catch {
    // do nothing
  }
  const { showCompletedTasks, showFutureTasks, openTaskDisplaySettings, completedAfter } = useTaskDisplaySettingsMobile(
    `project-${projectId}`
  );

  const { handleMoreOptions, handleAddTask } = useProject(project);

  if (!project) {
    return (
      <PageLayout
        header={{
          showBack: true,
          id: '',
          renderIcon: () => null,
          title: localize('project.notFound', 'Project not found'),
        }}
      >
        <div className="flex h-100 items-center justify-center text-t3">
          {localize('project.notFound', 'Project not found')}
        </div>
      </PageLayout>
    );
  }
  const { flattenedItemsResult, willDisappearObjectIdSet } = getProjectHeadingAndTasks({
    modelData: todoService.modelState,
    projectId: project.id,
    option: {
      showCompletedTasks,
      showFutureTasks,
      completedAfter,
      currentDate: getTodayTimestampInUtc(),
      recentChangedTaskSet: new Set<TreeID>(todoService.keepAliveElements as TreeID[]),
    },
  });
  const { flattenedItems } = flattenedItemsResult;
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return null;
    const overId = over.id as string;
    const activeId = active.id as string;
    const res = getFlattenedItemsDragEndPosition(activeId, overId, flattenedItemsResult);
    if (res) {
      if (res.type === 'createItem') {
        const taskId = todoService.addTask({
          title: '',
          position: res.position,
        });
        setTimeout(() => {
          todoService.editItem(taskId);
        }, 60);
      }
      if (res.type === 'moveItem') {
        todoService.updateTask(res.activeId, {
          position: res.position,
        });
      }
      if (res.type === 'moveHeader') {
        todoService.updateProjectHeading(res.activeId, {
          position: res.position,
        });
      }
    }
  };

  const dragOption = {
    overlayItem: {
      textProps: {
        hideProjectTitle: true,
      },
    },
    collisionDetection: getFlattenedItemsCollisionDetectionStrategy(flattenedItemsResult),
    onDragEnd: handleDragEnd,
    sortable: {
      items: flattenedItems.map((item) => item.id),
      strategy: verticalListSortingStrategy,
    },
  };

  const bottomMenu: FABProps = {
    mid: {
      onClick: handleAddTask,
    },
  };

  const header: PageHeaderProps = {
    showBack: true,
    id: project.id,
    title: '',
    actions: [
      { icon: <TaskDisplaySettingsIcon />, onClick: openTaskDisplaySettings },
      { icon: <MenuIcon />, onClick: handleMoreOptions },
    ],
  };

  return (
    <PageLayout
      meta={<ProjectMeta project={project} />}
      header={header}
      dragOption={dragOption}
      bottomMenu={bottomMenu}
    >
      <Files
        items={flattenedItems}
        result={flattenedItemsResult}
        willDisappearObjectIdSet={willDisappearObjectIdSet}
      ></Files>
    </PageLayout>
  );
};
