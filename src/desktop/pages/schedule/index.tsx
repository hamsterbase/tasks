import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { FilterIcon, ScheduledIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { getScheduledTasks } from '@/core/state/scheduled/getScheduledTask';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { TagFilterBar } from '@/desktop/components/filter/TagFilterBar';
import { useTagFilter } from '@/desktop/components/filter/useTagFilter';
import { DesktopProjectListItem } from '@/desktop/components/todo/DesktopProjectListItem';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { TestIds } from '@/testIds';
import React, { useEffect, useMemo, useState } from 'react';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

export const Schedule = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings('schedule');
  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);
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

  const willDisappearObjectIdSet = new Set(willDisappearObjectIds);

  // Create a simple dummy TaskList for components that require it but we don't need sorting
  const dummyTaskList = useMemo(() => {
    return new TaskList('Schedule-ReadOnly', [], [], null, null);
  }, []);

  return (
    <div className={desktopStyles.SchedulePageContainer}>
      <div className={desktopStyles.SchedulePageLayout}>
        <EntityHeader
          renderIcon={() => <ScheduledIcon />}
          title={localize('schedule', 'Schedule')}
          extraActions={[
            {
              icon: <FilterIcon strokeWidth={1.5} />,
              handleClick: tagFilter.clickFilter,
              title: localize('tasks.filterByTag', 'Filter by Tag'),
              testId: TestIds.EntityHeader.FilterToggleButton,
              isActive: tagFilter.isFilterOpen || tagFilter.currentTag.type !== 'all',
            },
          ]}
          internalActions={{ displaySettings: { onOpen: openTaskDisplaySettings } }}
          titleDetail={
            tagFilter.isFilterOpen ? (
              <TagFilterBar tags={tagFilter.tags} selected={tagFilter.currentTag} onSelect={tagFilter.selectTag} />
            ) : null
          }
        />

        <div className={desktopStyles.SchedulePageScrollArea}>
          <div className={desktopStyles.SchedulePageContent}>
            {scheduledGroups.map((group) => (
              <div key={group.key} className={desktopStyles.SchedulePageGroupContainer}>
                <div className={desktopStyles.SchedulePageGroupHeader}>
                  <h2 className={desktopStyles.SchedulePageGroupTitle}>{group.title}</h2>
                  {group.subtitle && <p className={desktopStyles.SchedulePageGroupSubtitle}>{group.subtitle}</p>}
                </div>

                <div className={desktopStyles.SchedulePageItemList}>
                  {group.items.map((item) => {
                    const willDisappear = willDisappearObjectIdSet.has(item.id);
                    if (item.type === 'project') {
                      return <DesktopProjectListItem key={item.id} project={item} />;
                    } else {
                      return (
                        <TaskListItem
                          key={item.id}
                          task={item}
                          disableDrag={true}
                          willDisappear={willDisappear}
                          taskList={dummyTaskList}
                        />
                      );
                    }
                  })}
                </div>
              </div>
            ))}

            {scheduledGroups.length === 0 && (
              <div className={desktopStyles.SchedulePageEmptyState}>
                <p className={desktopStyles.SchedulePageEmptyText}>
                  {localize('schedule.empty', 'No scheduled tasks')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
