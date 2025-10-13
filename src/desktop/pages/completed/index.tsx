import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { LogIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { ModelTypes } from '@/core/enum.ts';
import { getCompletedItems } from '@/core/state/completed/getCompletedItems';
import { ProjectInfoState, TaskInfo } from '@/core/state/type.ts';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopProjectListItem } from '@/desktop/components/todo/DesktopProjectListItem';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import React, { useMemo } from 'react';

export const Completed = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const completedTaskGroups = getCompletedItems(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    recentModifiedObjectIds: todoService.keepAliveElements,
  });

  const willDisappearObjectIdSet = new Set(completedTaskGroups.willDisappearObjectIds);

  const dummyTaskList = useMemo(() => {
    return new TaskList('Completed-ReadOnly', [], [], null, null);
  }, []);

  return (
    <div className={desktopStyles.SchedulePageContainer}>
      <div className={desktopStyles.SchedulePageLayout}>
        <EntityHeader renderIcon={() => <LogIcon />} title={localize('completed_tasks.title', 'Completed')} />

        <div className={desktopStyles.SchedulePageScrollArea}>
          <div className={desktopStyles.SchedulePageContent}>
            {completedTaskGroups.groups.map((group) => (
              <div key={group.label} className={desktopStyles.SchedulePageGroupContainer}>
                <div className={desktopStyles.SchedulePageGroupHeader}>
                  <h2 className={desktopStyles.CompletedPageGroupTitle}>{group.label}</h2>
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
