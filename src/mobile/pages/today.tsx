import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { CheckIcon, FilterIcon, TagIcon, TaskDisplaySettingsIcon, TodayIcon } from '@/components/icons';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { PopupActionItem } from '@/mobile/overlay/popupAction/PopupActionController';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { TestIds } from '@/testIds';
import { calculateDragDropAction } from '@/utils/dnd/calculateDragDropAction';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { singleListCollisionDetectionStrategy } from '@/utils/dnd/singleListCollisionDetectionStrategy';
import { DragEndEvent } from '@dnd-kit/core';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import { formatTodayTitle } from '@/core/time/formatTodayTitle';
import type { TreeID } from 'loro-crdt';
import React, { useEffect, useState } from 'react';
import { TagFilterBar } from '../components/filter/TagFilterBar';
import { TAG_FILTER_ALL, TAG_FILTER_UNTAGGED, TagFilter, isSameTagFilter } from '../components/filter/tagFilter';
import { useTagFilter } from '../components/filter/useTagFilter';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';
import { TaskItem } from '../components/todo/TaskItem';
import { styles } from '../theme';
import { useTaskDisplaySettingsMobile } from '../hooks/useTaskDisplaySettings';
import { ItemPosition } from '@/core/type';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

export const TodayPage = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const { showCompletedTasks, openTaskDisplaySettings } = useTaskDisplaySettingsMobile('today', {
    hideShowFutureTasks: true,
  });

  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);
  const popupAction = usePopupAction();

  const todayItems = getTodayItems(
    todoService.modelState,
    getTodayTimestampInUtc(),
    {
      showCompletedTasks,
      showFutureTasks: false,
      currentDate: getTodayTimestampInUtc(),
      completedAfter: getTodayTimestampInUtc(),
      recentChangedTaskSet: new Set<TreeID>(todoService.keepAliveElements as TreeID[]),
    },
    tagFilter.currentTag
  );

  useEffect(() => {
    setAllTags((previousTags) => (isSameTags(previousTags, todayItems.allTags) ? previousTags : todayItems.allTags));
  }, [todayItems.allTags]);

  const handleOpenTagFilter = () => {
    const makeItem = (name: string, value: TagFilter): PopupActionItem => ({
      icon: isSameTagFilter(tagFilter.currentTag, value) ? <CheckIcon /> : <TagIcon />,
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

  const items = todayItems.items;
  const handleCreateTask = (position?: ItemPosition) => {
    const taskId = todoService.addTask({
      title: '',
      startDate: getTodayTimestampInUtc(),
      position: {
        type: 'firstElement',
      },
    });
    if (position && position.type !== 'firstElement') {
      todoService.moveDateAssignedList(taskId, position);
    }
    setTimeout(() => {
      todoService.editItem(taskId);
    }, 100);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id as TreeID;
    const overId = event.over?.id as TreeID;
    if (!activeId || !overId) return;
    const action = calculateDragDropAction(
      overId,
      activeId,
      items.map((item) => item.id),
      undefined
    );
    if (action) {
      if (action.type === 'create') {
        handleCreateTask(action.position);
      } else if (action.type === 'move') {
        todoService.moveDateAssignedList(activeId, action.position);
      }
    }
  };

  const sortItems: (TreeID | string)[] = items
    .map((item) => item.id as string)
    .concat([DragDropElements.lastPlacement, DragDropElements.create]);

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'today',
        title: `${localize('today', 'Today')} (${formatTodayTitle()})`,
        renderIcon: (className: string) => <TodayIcon className={className} />,
        actions: [
          {
            icon: <FilterIcon className={styles.headerActionButtonIcon} strokeWidth={1.5} />,
            onClick: handleOpenTagFilter,
            testId: TestIds.PageHeader.FilterButton,
            isActive: tagFilter.currentTag.type !== 'all',
          },
          {
            icon: <TaskDisplaySettingsIcon className={styles.headerActionButtonIcon} strokeWidth={1.5} />,
            onClick: openTaskDisplaySettings,
          },
        ],
      }}
      dragOption={{
        collisionDetection: singleListCollisionDetectionStrategy,
        sortable: {
          items: sortItems,
          strategy: verticalListSortingStrategy,
          lastPlacement: true,
        },
        onDragEnd: handleDragEnd,
      }}
      onFabClick={() =>
        handleCreateTask({
          type: 'firstElement',
        })
      }
    >
      <TagFilterBar
        filter={tagFilter.currentTag}
        onOpen={handleOpenTagFilter}
        onClear={() => tagFilter.selectTag(TAG_FILTER_ALL)}
      />
      <div className={classNames(styles.taskItemGroupBackground, styles.taskItemGroupRound)}>
        {items.map((item) => {
          const willDisappear = todayItems.willDisappearObjectIdSet.has(item.id);
          if (item.type === 'project') {
            return <HomeProjectItem key={item.id} projectInfo={item} />;
          }
          return (
            <TaskItemWrapper key={item.id} willDisappear={willDisappear} id={item.id}>
              <TaskItem taskInfo={item} />
            </TaskItemWrapper>
          );
        })}
      </div>
    </PageLayout>
  );
};
