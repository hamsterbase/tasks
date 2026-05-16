import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { LogIcon } from '@/components/icons';
import { ModelTypes } from '@/core/enum.ts';
import { getCompletedItems } from '@/core/state/completed/getCompletedItems';
import { ProjectInfoState, TaskInfo } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useMobileTagFilter } from '../components/filter/useMobileTagFilter';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';
import { TaskItem } from '../components/todo/TaskItem';
import { styles } from '../theme';

export const MobileCompleted = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const tagFilter = useMobileTagFilter();
  const { observeTags } = tagFilter;

  const completedTaskGroups = getCompletedItems(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    recentModifiedObjectIds: todoService.keepAliveElements,
    tags: tagFilter.value,
  });

  useEffect(() => {
    observeTags(completedTaskGroups.allTags);
  }, [completedTaskGroups.allTags, observeTags]);

  const willDisappearObjectIdSet = new Set<string>(completedTaskGroups.willDisappearObjectIds);

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'completed_tasks',
        title: localize('completed_tasks.title', 'Completed'),
        renderIcon: (className: string) => <LogIcon className={className} />,
        actions: [tagFilter.headerAction],
      }}
    >
      {tagFilter.filterBar}
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
