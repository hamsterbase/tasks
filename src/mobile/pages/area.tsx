import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { MenuIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { TestIds } from '@/testIds';
import { isTaskVisible } from '@/core/time/filterProjectAndTask';
import { useService } from '@/hooks/use-service';
import { useArea } from '@/mobile/hooks/useArea';
import { styles } from '@/mobile/theme';
import { ITodoService } from '@/services/todo/common/todoService';
import { getAreaDragEndPositionAction } from '@/utils/dnd/area';
import { areaCollisionDetectionStrategyFactory } from '@/utils/dnd/areaCollisionDetchtionStrawe';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { DragEndEvent } from '@dnd-kit/core';
import classNames from 'classnames';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { useParams } from 'react-router';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';
import { TaskItem } from '../components/todo/TaskItem';
import { useTaskDisplaySettingsMobile } from '../hooks/useTaskDisplaySettings';
import { localize } from '@/nls';
import AreaMeta from './area/AreaMeta';

const useAreaId = (): TreeID => {
  const todoService = useService(ITodoService);
  const { areaUID } = useParams<{ areaUID?: string }>();
  if (!areaUID) {
    return '0@0';
  }
  const areaId = todoService.modelState.taskObjectUidMap.get(areaUID)?.id;
  if (!areaId) {
    return '0@0';
  }
  return areaId;
};

export const AreaPage = () => {
  const todoService = useService(ITodoService);
  const areaId = useAreaId();
  const { areaDetail, handleMoreOptions, handleAddTask, isTask, isProject, handleEditTag, handleUpdateTitle } =
    useArea(areaId);
  const { showCompletedTasks, showFutureTasks, openTaskDisplaySettings, completedAfter } = useTaskDisplaySettingsMobile(
    `area-${areaId}`
  );

  if (!areaDetail) {
    return <div>Area not found</div>;
  }

  const recentChangedTaskSet = new Set<TreeID>(todoService.keepAliveElements as TreeID[]);
  const willDisappearObjectIdSet = new Set<string>();
  const tasks = areaDetail.taskList.filter((task) => {
    const res = isTaskVisible(task, {
      showCompletedTasks,
      showFutureTasks,
      completedAfter,
      currentDate: getTodayTimestampInUtc(),
      recentChangedTaskSet,
    });
    if (res === 'recentChanged') {
      willDisappearObjectIdSet.add(task.id);
    }
    return res === 'valid' || res === 'recentChanged';
  });

  const projects = areaDetail.projectList.filter((task) => {
    const res = isTaskVisible(task, {
      showCompletedTasks,
      showFutureTasks,
      completedAfter,
      currentDate: getTodayTimestampInUtc(),
      recentChangedTaskSet,
    });
    return res === 'valid' || res === 'recentChanged';
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id as TreeID;
    const overId = event.over?.id as TreeID;
    if (!activeId || !overId) {
      return;
    }
    const action = getAreaDragEndPositionAction(activeId, overId, areaDetail, todoService.modelState);
    if (action) {
      switch (action.type) {
        case 'createTask':
          handleAddTask(action.position);
          break;

        case 'move': {
          if (action.moveType === 'task') {
            todoService.updateTask(action.activeId, {
              position: action.position,
            });
          } else if (action.moveType === 'project') {
            todoService.updateProject(action.activeId, {
              position: action.position,
            });
          }
          break;
        }
      }
    }
  };

  const sortItems: string[] = [
    ...areaDetail.projectList.map((project) => project.id),
    ...areaDetail.taskList.map((task) => task.id),
    DragDropElements.lastPlacement,
    DragDropElements.create,
  ];

  return (
    <PageLayout
      header={{
        showBack: true,
        id: areaDetail.id,
        title: '',
        actions: [
          { icon: <TaskDisplaySettingsIcon />, onClick: openTaskDisplaySettings },
          { icon: <MenuIcon />, onClick: handleMoreOptions, testId: TestIds.PageHeader.MenuButton },
        ],
      }}
      meta={<AreaMeta areaDetail={areaDetail} onUpdateTitle={handleUpdateTitle} onEditTag={handleEditTag} />}
      dragOption={{
        overlayItem: {
          projectProps: {
            hideSubtitle: true,
          },
        },
        collisionDetection: areaCollisionDetectionStrategyFactory(isProject, isTask),
        onDragEnd: handleDragEnd,
        sortable: {
          items: sortItems,
          lastPlacement: true,
        },
      }}
      onFabClick={handleAddTask}
    >
      <div className="flex flex-col">
        <div className={classNames(styles.areaDetailSectionHeader, styles.areaDetailSectionHeaderIndent)}>
          <span className={styles.areaDetailSectionTitle}>{localize('area.projects', 'Projects')}</span>
        </div>
        <div className={styles.areaDetailSectionCard}>
          {projects.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-t3 text-sm">
              {localize('area.noProjects', 'No projects')}
            </div>
          ) : (
            projects.map((project) => <HomeProjectItem key={project.id} projectInfo={project} hideSubtitle={true} />)
          )}
        </div>
        <div className="h-3" />
        <div className={classNames(styles.areaDetailSectionHeader, styles.areaDetailSectionHeaderIndent)}>
          <span className={styles.areaDetailSectionTitle}>{localize('area.tasks', 'Tasks')}</span>
        </div>
        <div className={styles.areaDetailSectionCard}>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-t3 text-sm">
              {localize('area.noTasks', 'No tasks')}
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItemWrapper key={task.id} willDisappear={willDisappearObjectIdSet.has(task.id)} id={task.id}>
                <TaskItem key={task.id} taskInfo={task} />
              </TaskItemWrapper>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
};
