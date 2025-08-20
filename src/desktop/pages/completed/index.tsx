import { getTodayTimestampInUtc } from '@/base/common/time';
import { LogIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { ModelTypes } from '@/core/enum.ts';
import { getCompletedItems } from '@/core/state/completed/getCompletedItems';
import { ProjectInfoState, TaskInfo } from '@/core/state/type.ts';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopProjectListItem } from '@/desktop/components/todo/DesktopProjectListItem';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
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
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <EntityHeader
          renderIcon={() => <LogIcon className="size-5 text-t2" />}
          title={localize('completed_tasks.title', 'Completed')}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto p-6 space-y-6">
            {completedTaskGroups.groups.map((group) => (
              <div key={group.label} className="space-y-4">
                <div className="space-y-1 flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-t1 w-10">{group.label}</h2>
                </div>

                <div className="space-y-2">
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
              <div className="text-center py-12">
                <p className="text-t3 text-lg">
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
