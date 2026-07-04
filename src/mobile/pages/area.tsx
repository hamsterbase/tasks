import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { CheckIcon, FilterIcon, MenuIcon, TagIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { TestIds } from '@/testIds';
import { isTaskVisible } from '@/core/time/filterProjectAndTask';
import { useService } from '@/hooks/use-service';
import { useArea } from '@/mobile/hooks/useArea';
import { PopupActionItem } from '@/mobile/overlay/popupAction/PopupActionController';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { styles } from '@/mobile/theme';
import { ITodoService } from '@/services/todo/common/todoService';
import { computeSectionRounding } from '@/mobile/components/dnd/projectedRounding';
import { getAreaDragEndPositionAction } from '@/utils/dnd/area';
import { areaCollisionDetectionStrategyFactory } from '@/utils/dnd/areaCollisionDetchtionStrawe';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { DragEndEvent, useDndContext } from '@dnd-kit/core';
import classNames from 'classnames';
import type { TreeID } from 'loro-crdt';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { TagFilterBar } from '../components/filter/TagFilterBar';
import { TAG_FILTER_ALL, TAG_FILTER_UNTAGGED, TagFilter, isSameTagFilter } from '../components/filter/tagFilter';
import { useTagFilter } from '../components/filter/useTagFilter';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';
import { TaskItem } from '../components/todo/TaskItem';
import { useTaskDisplaySettingsMobile } from '../hooks/useTaskDisplaySettings';
import { localize } from '@/nls';
import AreaMeta from './area/AreaMeta';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

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

interface AreaSectionsProps {
  projects: React.ComponentProps<typeof HomeProjectItem>['projectInfo'][];
  tasks: React.ComponentProps<typeof TaskItem>['taskInfo'][];
  willDisappearObjectIdSet: Set<string>;
  showProjectsSection: boolean;
}

// The card background lives on each row (see projectedRounding.ts), so this
// has to render inside PageLayout's DndContext to follow the drag state.
const AreaSections: React.FC<AreaSectionsProps> = ({
  projects,
  tasks,
  willDisappearObjectIdSet,
  showProjectsSection,
}) => {
  const { active, over } = useDndContext();
  const activeId = active?.id as string | undefined;
  const overId = over?.id as string | undefined;
  const projectRounding = computeSectionRounding(
    projects.map((project) => project.id),
    activeId,
    overId
  );
  const taskRounding = computeSectionRounding(
    tasks.map((task) => task.id),
    activeId,
    overId
  );
  const emptyStateClassName = classNames(
    styles.areaDetailEmptyState,
    styles.taskItemGroupBackground,
    styles.taskItemGroupTopRound,
    styles.taskItemGroupBottomRound
  );

  return (
    <div className={styles.pageContentColumn}>
      {showProjectsSection && (
        <>
          <div className={classNames(styles.areaDetailSectionHeader, styles.areaDetailSectionHeaderIndent)}>
            <span className={styles.areaDetailSectionTitle}>{localize('area.projects', 'Projects')}</span>
          </div>
          <div>
            {projects.length === 0 ? (
              <div className={emptyStateClassName}>{localize('area.noProjects', 'No projects')}</div>
            ) : (
              projects.map((project) => (
                <HomeProjectItem
                  key={project.id}
                  projectInfo={project}
                  hideSubtitle={true}
                  className={classNames(styles.taskItemGroupBackground, {
                    [styles.taskItemGroupTopRound]: projectRounding.top.has(project.id),
                    [styles.taskItemGroupBottomRound]: projectRounding.bottom.has(project.id),
                  })}
                />
              ))
            )}
          </div>
          <div className={styles.areaDetailSectionSpacer} />
        </>
      )}
      <div className={classNames(styles.areaDetailSectionHeader, styles.areaDetailSectionHeaderIndent)}>
        <span className={styles.areaDetailSectionTitle}>{localize('area.tasks', 'Tasks')}</span>
      </div>
      <div>
        {tasks.length === 0 ? (
          <div className={emptyStateClassName}>{localize('area.noTasks', 'No tasks')}</div>
        ) : (
          tasks.map((task) => (
            <TaskItemWrapper key={task.id} willDisappear={willDisappearObjectIdSet.has(task.id)} id={task.id}>
              <TaskItem
                key={task.id}
                taskInfo={task}
                className={classNames(styles.taskItemGroupBackground, {
                  [styles.taskItemGroupTopRound]: taskRounding.top.has(task.id),
                  [styles.taskItemGroupBottomRound]: taskRounding.bottom.has(task.id),
                })}
              />
            </TaskItemWrapper>
          ))
        )}
      </div>
    </div>
  );
};

export const AreaPage = () => {
  const todoService = useService(ITodoService);
  const areaId = useAreaId();
  const { areaDetail, handleMoreOptions, handleAddTask, isTask, isProject, handleEditTag, handleUpdateTitle } =
    useArea(areaId);
  const { showCompletedTasks, showFutureTasks, openTaskDisplaySettings, completedAfter } = useTaskDisplaySettingsMobile(
    `area-${areaId}`
  );

  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);
  const popupAction = usePopupAction();

  const allTagsSet = new Set<string>();
  areaDetail?.taskList.forEach((task) => task.tags?.forEach((tag) => allTagsSet.add(tag)));
  areaDetail?.projectList.forEach((project) => project.tags?.forEach((tag) => allTagsSet.add(tag)));
  const latestAllTags = Array.from(allTagsSet).sort();

  useEffect(() => {
    setAllTags((previousTags) => (isSameTags(previousTags, latestAllTags) ? previousTags : latestAllTags));
  }, [latestAllTags]);

  if (!areaDetail) {
    return <div>Area not found</div>;
  }

  const currentTagFilter = tagFilter.currentTag;
  const isTagFilterActive = currentTagFilter.type !== 'all';
  const isEntityMatchedByTags = (entity: { tags?: string[] }): boolean => {
    if (currentTagFilter.type === 'all') {
      return true;
    }
    if (currentTagFilter.type === 'untagged') {
      return !entity.tags || entity.tags.length === 0;
    }
    return !!entity.tags?.includes(currentTagFilter.value);
  };

  const handleOpenTagFilter = () => {
    const makeItem = (name: string, value: TagFilter): PopupActionItem => ({
      icon: isSameTagFilter(currentTagFilter, value) ? <CheckIcon /> : <TagIcon />,
      name,
      onClick: () => tagFilter.selectTag(value),
    });
    popupAction({
      description: localize('tasks.filterByTag', 'Filter by Tag'),
      groups: [
        {
          items: [
            makeItem(localize('project.tagFilter.all', 'All'), TAG_FILTER_ALL),
            ...tagFilter.tags.map((tag) => makeItem(tag, { type: 'tag', value: tag })),
            makeItem(localize('project.tagFilter.untagged', 'No Tags'), TAG_FILTER_UNTAGGED),
          ],
        },
      ],
    });
  };

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
    if (res === 'invalid') {
      return false;
    }
    if (!isEntityMatchedByTags(task) && res !== 'recentChanged') {
      return false;
    }
    if (res === 'recentChanged') {
      willDisappearObjectIdSet.add(task.id);
    }
    return true;
  });

  const projects = areaDetail.projectList.filter((task) => {
    const res = isTaskVisible(task, {
      showCompletedTasks,
      showFutureTasks,
      completedAfter,
      currentDate: getTodayTimestampInUtc(),
      recentChangedTaskSet,
    });
    if (res === 'invalid') {
      return false;
    }
    if (!isEntityMatchedByTags(task) && res !== 'recentChanged') {
      return false;
    }
    return true;
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
          {
            icon: <FilterIcon className={styles.headerActionButtonIcon} strokeWidth={1.5} />,
            onClick: handleOpenTagFilter,
            testId: TestIds.PageHeader.FilterButton,
            isActive: isTagFilterActive,
          },
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
      <TagFilterBar
        filter={currentTagFilter}
        onOpen={handleOpenTagFilter}
        onClear={() => tagFilter.selectTag(TAG_FILTER_ALL)}
      />
      <AreaSections
        projects={projects}
        tasks={tasks}
        willDisappearObjectIdSet={willDisappearObjectIdSet}
        showProjectsSection={projects.length > 0 || !isTagFilterActive}
      />
    </PageLayout>
  );
};
