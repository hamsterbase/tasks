import { getTodayTimestampInUtc } from '@/base/common/time';
import { ScheduledIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { getScheduledTasks } from '@/core/state/scheduled/getScheduledTask';
import { EntityHeader, EntityHeaderAction } from '@/desktop/components/common/EntityHeader';
import { TaskListItem } from '@/desktop/components/taskListItem/TaskListItem';
import { DesktopProjectListItem } from '@/desktop/components/todo/DesktopProjectListItem';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import React, { useMemo } from 'react';

export const Schedule = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings('schedule');

  const { scheduledGroups, willDisappearObjectIds } = getScheduledTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    recentModifiedObjectIds: todoService.keepAliveElements,
    editingContentId: todoService.editingContent?.id,
  });

  const willDisappearObjectIdSet = new Set(willDisappearObjectIds);

  // Create a simple dummy TaskList for components that require it but we don't need sorting
  const dummyTaskList = useMemo(() => {
    return new TaskList('Schedule-ReadOnly', [], [], null, null);
  }, []);

  const handleOpenTaskDisplaySettings = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    openTaskDisplaySettings(rect.right, rect.bottom + 4);
  };

  const actions: EntityHeaderAction[] = [
    {
      icon: <TaskDisplaySettingsIcon className="size-4" />,
      handleClick: handleOpenTaskDisplaySettings,
      title: localize('schedule.taskDisplaySettings', 'Task Display Settings'),
    },
  ];

  return (
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <EntityHeader
          renderIcon={() => <ScheduledIcon className="size-5 text-t2" />}
          title={localize('schedule', 'Schedule')}
          actions={actions}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto p-6 space-y-6">
            {scheduledGroups.map((group) => (
              <div key={group.key} className="space-y-4">
                <div className="space-y-1 flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-t1 w-10">{group.title}</h2>
                  {group.subtitle && <p className="text-sm text-t2">{group.subtitle}</p>}
                </div>

                <div className="space-y-2">
                  {group.items.map((item) => {
                    const willDisappear = willDisappearObjectIdSet.has(item.id);
                    if (item.type === 'project') {
                      return <DesktopProjectListItem key={item.id} project={item} />;
                    } else {
                      return (
                        <TaskListItem
                          key={item.id}
                          task={item}
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
              <div className="text-center py-12">
                <p className="text-t3 text-lg">{localize('schedule.empty', 'No scheduled tasks')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
