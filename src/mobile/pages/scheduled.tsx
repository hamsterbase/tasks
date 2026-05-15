import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { CheckIcon, FilterIcon, ScheduledIcon, TagIcon } from '@/components/icons';
import { ModelTypes } from '@/core/enum.ts';
import { getScheduledTasks } from '@/core/state/scheduled/getScheduledTask';
import { ProjectInfoState, TaskInfo } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { TaskItem } from '@/mobile/components/todo/TaskItem.tsx';
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
import { styles } from '../theme';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

export const ScheduledPage = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);
  const popupAction = usePopupAction();

  const {
    scheduledGroups,
    willDisappearObjectIds,
    allTags: latestAllTags,
  } = getScheduledTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    recentModifiedObjectIds: todoService.keepAliveElements,
    editingContentId: todoService.editingContent?.id,
    tags: tagFilter.currentTag,
  });

  useEffect(() => {
    setAllTags((previousTags) => (isSameTags(previousTags, latestAllTags) ? previousTags : latestAllTags));
  }, [latestAllTags]);

  const willDisappearObjectIdSet = new Set<string>(willDisappearObjectIds);

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
        id: 'scheduled',
        title: localize('scheduled.title', 'Scheduled'),
        renderIcon: (className: string) => <ScheduledIcon className={className} />,
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
      <div className={styles.pageContentColumn}>
        {scheduledGroups.map((group) => (
          <React.Fragment key={group.title}>
            <div key={group.title} className={styles.scheduledGroupCard}>
              <div className={classNames(styles.taskItemGroupHeader, styles.pageContentPaddingX)}>
                <span className={styles.taskItemGroupTitle}>{group.title}</span>
                {group.subtitle && <span className={styles.taskItemGroupSubtitle}>{group.subtitle}</span>}
              </div>
              {group.items.map((item) => {
                if (item.type === ModelTypes.project) {
                  return <HomeProjectItem key={item.id} projectInfo={item as ProjectInfoState}></HomeProjectItem>;
                }
                return (
                  <TaskItemWrapper key={item.id} willDisappear={willDisappearObjectIdSet.has(item.id)} id={item.id}>
                    <TaskItem taskInfo={item as TaskInfo}></TaskItem>
                  </TaskItemWrapper>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </PageLayout>
  );
};
