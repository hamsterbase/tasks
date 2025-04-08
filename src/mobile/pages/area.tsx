import { getTodayTimestampInUtc } from '@/base/common/time';
import { AreaIcon, MenuIcon, TagIcon } from '@/components/icons';
import { isTaskVisible } from '@/core/time/filterProjectAndTask';
import { useService } from '@/hooks/use-service';
import { useArea } from '@/hooks/useArea';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { getAreaDragEndPositionAction } from '@/utils/dnd/area';
import { areaCollisionDetectionStrategyFactory } from '@/utils/dnd/areaCollisionDetchtionStrawe';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { DragEndEvent } from '@dnd-kit/core';
import classNames from 'classnames';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { useParams } from 'react-router';
import { InfoItemGroup } from '../components/InfoItem';
import { InfoItemTags } from '../components/infoItem/tags';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';
import { TaskItem } from '../components/todo/TaskItem';

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
  const { areaDetail, handleMoreOptions, handleAddTask, isTask, isProject, handleEditTag } = useArea(areaId);
  const { showCompletedTasks, showFutureTasks, openTaskDisplaySettings, completedAfter } = useTaskDisplaySettings(
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

  const areaTags = areaDetail.tags || [];

  return (
    <PageLayout
      header={{
        handleClickTaskDisplaySettings: openTaskDisplaySettings,
        id: areaDetail.id,
        title: areaDetail.title,
        headerPlaceholder: localize('area.title_placeholder', 'New Area'),
        renderIcon: (className: string) => <AreaIcon className={className} />,
        onSave: (title: string) => {
          todoService.updateArea(areaDetail.id, { title });
        },
      }}
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
      bottomMenu={{
        left: 'back',
        mid: {
          onClick: handleAddTask,
        },
        right: {
          icon: <MenuIcon />,
          status: 'normal',
          onClick: handleMoreOptions,
        },
      }}
    >
      <div className="flex flex-col gap-2">
        <InfoItemGroup
          className={classNames(
            `px-1 ${styles.infoItemGroupGap} ${styles.infoItemGroupRound} ${styles.infoItemGroupBackground}`,
            {
              hidden: areaTags.length === 0,
            }
          )}
          items={[
            {
              itemKey: 'tags',
              show: areaTags.length > 0,
              background: 'bg-bg1!',
              icon: <TagIcon />,
              content: <InfoItemTags tags={areaTags} />,
              onClick: handleEditTag,
            },
          ]}
        />
        {projects.length > 0 && (
          <div className={classNames(styles.taskItemGroupBackground, styles.taskItemGroupRound)}>
            {projects.map((project) => (
              <HomeProjectItem key={project.id} projectInfo={project} hideSubtitle={true} />
            ))}
          </div>
        )}
        <div className={classNames(styles.taskItemGroupBackground, styles.taskItemGroupRound)}>
          {tasks.map((task) => (
            <TaskItemWrapper key={task.id} willDisappear={willDisappearObjectIdSet.has(task.id)} id={task.id}>
              <TaskItem key={task.id} taskInfo={task} />
            </TaskItemWrapper>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};
