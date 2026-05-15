import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { CheckIcon, FilterIcon, LogIcon, TagIcon } from '@/components/icons';
import { ModelTypes } from '@/core/enum.ts';
import { getCompletedItems } from '@/core/state/completed/getCompletedItems';
import { ProjectInfoState, TaskInfo } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { PopupActionItem } from '@/mobile/overlay/popupAction/PopupActionController';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { TagFilterBar } from '../components/filter/TagFilterBar';
import { TAG_FILTER_ALL, TAG_FILTER_UNTAGGED, TagFilter, isSameTagFilter } from '../components/filter/tagFilter';
import { useTagFilter } from '../components/filter/useTagFilter';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';
import { TaskItem } from '../components/todo/TaskItem';
import { styles } from '../theme';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

export const MobileCompleted = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);
  const popupAction = usePopupAction();

  const completedTaskGroups = getCompletedItems(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    recentModifiedObjectIds: todoService.keepAliveElements,
    tags: tagFilter.currentTag,
  });

  useEffect(() => {
    setAllTags((previousTags) =>
      isSameTags(previousTags, completedTaskGroups.allTags) ? previousTags : completedTaskGroups.allTags
    );
  }, [completedTaskGroups.allTags]);

  const willDisappearObjectIdSet = new Set<string>(completedTaskGroups.willDisappearObjectIds);

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

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'completed_tasks',
        title: localize('completed_tasks.title', 'Completed'),
        renderIcon: (className: string) => <LogIcon className={className} />,
        actions: [
          {
            icon: <FilterIcon className={styles.headerActionButtonIcon} strokeWidth={1.5} />,
            onClick: handleOpenTagFilter,
            testId: TestIds.PageHeader.FilterButton,
            isActive: tagFilter.currentTag.type !== 'all',
          },
        ],
      }}
    >
      <TagFilterBar
        filter={tagFilter.currentTag}
        onOpen={handleOpenTagFilter}
        onClear={() => tagFilter.selectTag(TAG_FILTER_ALL)}
      />
      {completedTaskGroups.groups.length === 0 ? (
        <div className={styles.pageEmptyState}>
          {localize('completed_tasks.noCompletedTasks', 'No completed tasks or projects yet')}
        </div>
      ) : (
        <>
          {completedTaskGroups.groups.map((group) => (
            <div
              key={group.label}
              className={classNames(
                styles.taskItemGroupBackground,
                styles.taskItemGroupRound,
                styles.taskItemGroupSpacing
              )}
            >
              <div className={classNames(styles.taskItemGroupHeader, styles.taskItemPaddingX)}>
                <span className={styles.taskItemGroupTitle}>{group.label}</span>
              </div>
              <div>
                {group.tasks.map((taskInfo) => {
                  if (taskInfo.type === ModelTypes.project) {
                    return <HomeProjectItem key={taskInfo.id} projectInfo={taskInfo as ProjectInfoState} />;
                  }
                  return (
                    <TaskItemWrapper
                      key={taskInfo.id}
                      willDisappear={willDisappearObjectIdSet.has(taskInfo.id)}
                      id={taskInfo.id}
                    >
                      <TaskItem key={taskInfo.id} taskInfo={taskInfo as TaskInfo}></TaskItem>
                    </TaskItemWrapper>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </PageLayout>
  );
};
