import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { CheckIcon, FilterIcon, InboxIcon, TagIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { PopupActionItem } from '@/mobile/overlay/popupAction/PopupActionController';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { TestIds } from '@/testIds';
import { calculateDragDropAction } from '@/utils/dnd/calculateDragDropAction';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { singleListCollisionDetectionStrategy } from '@/utils/dnd/singleListCollisionDetectionStrategy';
import { DragEndEvent } from '@dnd-kit/core';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import type { TreeID } from 'loro-crdt';
import React, { useEffect, useState } from 'react';
import { TagFilterBar } from '../components/filter/TagFilterBar';
import { TAG_FILTER_ALL, TAG_FILTER_UNTAGGED, TagFilter, isSameTagFilter } from '../components/filter/tagFilter';
import { useTagFilter } from '../components/filter/useTagFilter';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { TaskItem } from '../components/todo/TaskItem';
import { styles } from '../theme';
import { useTaskDisplaySettingsMobile } from '../hooks/useTaskDisplaySettings';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

export const InboxPage = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const { showFutureTasks, showCompletedTasks, openTaskDisplaySettings, completedAfter } =
    useTaskDisplaySettingsMobile('inbox');

  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);
  const popupAction = usePopupAction();

  const {
    inboxTasks,
    willDisappearObjectIdSet,
    allTags: latestAllTags,
  } = getInboxTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    showFutureTasks,
    showCompletedTasks,
    showCompletedTasksAfter: completedAfter,
    keepAliveElements: todoService.keepAliveElements,
    tags: tagFilter.currentTag,
  });

  useEffect(() => {
    setAllTags((previousTags) => (isSameTags(previousTags, latestAllTags) ? previousTags : latestAllTags));
  }, [latestAllTags]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || typeof over.id !== 'string' || typeof active.id !== 'string') return;
    const action = calculateDragDropAction(
      over.id,
      active.id,
      inboxTasks.map((task) => task.id)
    );
    if (!action) return;
    if (action.type === 'create') {
      const taskId = todoService.addTask({
        title: '',
        position: action.position,
      });
      setTimeout(() => {
        todoService.editItem(taskId);
      }, 60);
    } else {
      todoService.updateTask(active.id as TreeID, {
        position: action.position,
      });
    }
  };

  const handleCreateTask = () => {
    const task = todoService.addTask({
      title: '',
    });
    todoService.editItem(task);
  };

  const sortItems: string[] = inboxTasks
    .map((task): string => task.id)
    .concat([DragDropElements.lastPlacement, DragDropElements.create]);

  return (
    <PageLayout
      onFabClick={handleCreateTask}
      header={{
        showBack: true,
        id: 'inbox',
        title: localize('inbox', 'Inbox'),
        renderIcon: (className: string) => <InboxIcon className={className} />,
        actions: [
          {
            icon: <FilterIcon className={styles.headerActionButtonIcon} strokeWidth={1.5} />,
            onClick: handleOpenTagFilter,
            testId: TestIds.PageHeader.FilterButton,
            isActive: tagFilter.currentTag.type !== 'all',
          },
          { icon: <TaskDisplaySettingsIcon />, onClick: openTaskDisplaySettings },
        ],
      }}
      dragOption={{
        overlayItem: {},
        collisionDetection: singleListCollisionDetectionStrategy,
        onDragEnd: handleDragEnd,
        sortable: {
          lastPlacement: true,
          items: sortItems,
          strategy: verticalListSortingStrategy,
        },
      }}
    >
      <TagFilterBar
        filter={tagFilter.currentTag}
        onOpen={handleOpenTagFilter}
        onClear={() => tagFilter.selectTag(TAG_FILTER_ALL)}
      />
      <div className={classNames(styles.taskItemGroupBackground, styles.taskItemGroupRound)}>
        {inboxTasks.map((task) => (
          <TaskItemWrapper key={task.id} willDisappear={willDisappearObjectIdSet.has(task.id)} id={task.id}>
            <TaskItem taskInfo={task} key={task.id} />
          </TaskItemWrapper>
        ))}
      </div>
    </PageLayout>
  );
};
