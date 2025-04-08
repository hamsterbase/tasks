import { getTodayTimestampInUtc } from '@/base/common/time';
import { LogIcon } from '@/components/icons';
import { ModelTypes } from '@/core/enum.ts';
import { getCompletedItems } from '@/core/state/completed/getCompletedItems';
import { ProjectInfoState, TaskInfo } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import classNames from 'classnames';
import React from 'react';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';
import { TaskItem } from '../components/todo/TaskItem';
import { styles } from '../theme';

export const MobileCompleted = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const completedTaskGroups = getCompletedItems(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    recentModifiedObjectIds: todoService.keepAliveElements,
  });
  const willDisappearObjectIdSet = new Set<string>(completedTaskGroups.willDisappearObjectIds);
  return (
    <PageLayout
      header={{
        id: 'completed_tasks',
        title: localize('completed_tasks.title', 'Completed'),
        renderIcon: (className: string) => <LogIcon className={className} />,
      }}
      bottomMenu={{
        left: 'back',
      }}
    >
      {completedTaskGroups.groups.length === 0 ? (
        <div className="flex h-100 items-center justify-center text-t3">
          {localize('completed_tasks.noCompletedTasks', 'No completed tasks or projects yet')}
        </div>
      ) : (
        <div className={classNames(styles.taskItemGroupBackground, styles.taskItemGroupRound)}>
          {completedTaskGroups.groups.map((group) => (
            <div key={group.label}>
              <div className={classNames('py-1.5 text-xl font-medium text-t1', styles.taskItemPaddingX)}>
                {group.label}
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
        </div>
      )}
    </PageLayout>
  );
};
