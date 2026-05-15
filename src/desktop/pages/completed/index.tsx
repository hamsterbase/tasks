import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { FilterIcon, LogIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { ModelTypes } from '@/core/enum.ts';
import { getCompletedItems } from '@/core/state/completed/getCompletedItems';
import { ProjectInfoState, TaskInfo } from '@/core/state/type.ts';
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

export const Completed = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings('completed');
  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);

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

  const willDisappearObjectIdSet = new Set(completedTaskGroups.willDisappearObjectIds);

  const dummyTaskList = useMemo(() => {
    return new TaskList('Completed-ReadOnly', [], [], null, null);
  }, []);

  return (
    <div className={desktopStyles.SchedulePageContainer}>
      <div className={desktopStyles.SchedulePageLayout}>
        <EntityHeader
          renderIcon={() => <LogIcon />}
          title={localize('completed_tasks.title', 'Completed')}
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
            {completedTaskGroups.groups.map((group) => (
              <div key={group.label} className={desktopStyles.SchedulePageGroupContainer}>
                <div className={desktopStyles.TodaySectionHeading}>
                  <h2 className={desktopStyles.CompletedPageGroupTitle}>{group.label}</h2>
                  <span className={desktopStyles.TodaySectionCount}>{group.tasks.length}</span>
                </div>

                <div className={desktopStyles.SchedulePageItemList}>
                  {group.tasks.map((item) => {
                    const willDisappear = willDisappearObjectIdSet.has(item.id);
                    if (item.type === ModelTypes.project) {
                      return <DesktopProjectListItem key={item.id} project={item as ProjectInfoState} />;
                    } else {
                      return (
                        <TaskListItem
                          disableDrag
                          key={item.id}
                          task={item as TaskInfo}
                          willDisappear={willDisappear}
                          taskList={dummyTaskList}
                        />
                      );
                    }
                  })}
                </div>
              </div>
            ))}

            {completedTaskGroups.groups.length === 0 && (
              <div className={desktopStyles.SchedulePageEmptyState}>
                <p className={desktopStyles.SchedulePageEmptyText}>
                  {localize('completed_tasks.noCompletedTasks', 'No completed tasks or projects yet')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
