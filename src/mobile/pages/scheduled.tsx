import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { ScheduledIcon } from '@/components/icons';
import { ModelTypes } from '@/core/enum.ts';
import { getScheduledTasks } from '@/core/state/scheduled/getScheduledTask';
import { ProjectInfoState, TaskInfo } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { TaskItem } from '@/mobile/components/todo/TaskItem.tsx';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import React from 'react';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { HomeProjectItem } from '../components/todo/HomeProjectItem';

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
        showBack: true,
        id: 'scheduled',
        title: localize('scheduled.title', 'Scheduled'),
        renderIcon: (className: string) => <ScheduledIcon className={className} />,
      }}
    >
      <div className="flex flex-col">
        {scheduledGroups.map((group) => (
          <React.Fragment key={group.title}>
            <div key={group.title} className="ui-card-normal mb-3">
              <div className="flex items-baseline gap-3 px-4 py-3">
                <span className="text-xl font-medium text-t1 leading-none">{group.title}</span>
                {group.subtitle && <span className="text-sm text-t3">{group.subtitle}</span>}
              </div>
              {group.items.map((item) => {
                if (item.type === ModelTypes.project) {
                  return (
                    <HomeProjectItem
                      key={item.id}
                      projectInfo={item as ProjectInfoState}
                      hideStartDate
                    ></HomeProjectItem>
                  );
                }
                return (
                  <TaskItemWrapper key={item.id} willDisappear={willDisappearObjectIdSet.has(item.id)} id={item.id}>
                    <TaskItem taskInfo={item as TaskInfo} hideStartDate></TaskItem>
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
