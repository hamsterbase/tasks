import { getTodayTimestampInUtc } from '@/base/common/time';
import { ScheduledIcon } from '@/components/icons';
import { ModelTypes } from '@/core/enum.ts';
import { getScheduledTasks } from '@/core/state/scheduled/getScheduledTask';
import { ProjectInfoState, TaskInfo } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { TaskItem } from '@/mobile/components/todo/TaskItem.tsx';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import classNames from 'classnames';
import React from 'react';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';
import { styles } from '../theme';

export const ScheduledPage = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const { scheduledGroups, willDisappearObjectIds } = getScheduledTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    recentModifiedObjectIds: todoService.keepAliveElements,
    editingContentId: todoService.editingContent?.id,
  });

  const willDisappearObjectIdSet = new Set<string>(willDisappearObjectIds);

  return (
    <PageLayout
      header={{
        id: 'scheduled',
        title: localize('scheduled.title', 'Scheduled'),
        renderIcon: (className: string) => <ScheduledIcon className={className} />,
      }}
      bottomMenu={{
        left: 'back',
      }}
    >
      <div className="flex flex-col gap-2">
        {scheduledGroups.map((group) => (
          <React.Fragment key={group.title}>
            <div key={group.title} className={classNames(styles.taskItemGroupBackground, styles.taskItemGroupRound)}>
              <div className={classNames('py-2 flex items-baseline gap-2', styles.taskItemPaddingX)}>
                <div className="text-xl font-medium text-t1">{group.title}</div>
                {group.subtitle && <div className="text-sm text-t3">{group.subtitle}</div>}
              </div>
              <div>
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
            </div>
          </React.Fragment>
        ))}
      </div>
    </PageLayout>
  );
};
