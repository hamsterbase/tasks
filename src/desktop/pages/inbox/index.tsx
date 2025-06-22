import { getTodayTimestampInUtc } from '@/base/common/time';
import { InboxIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { TaskListItem } from '@/desktop/components/taskListItem/TaskListItem';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings.ts';
import { localize } from '@/nls';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import React, { useCallback } from 'react';
import { flushSync } from 'react-dom';

export const Inbox = () => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  useWatchEvent(listService.onMainListChange);
  useWatchEvent(todoService.onStateChange);
  const { showFutureTasks, showCompletedTasks, completedAfter } = useTaskDisplaySettings('inbox');
  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings('inbox');

  const { inboxTasks, willDisappearObjectIdSet } = getInboxTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    showFutureTasks,
    showCompletedTasks,
    showCompletedTasksAfter: completedAfter,
    keepAliveElements: todoService.keepAliveElements,
  });

  if (listService.mainList && listService.mainList.name === 'Inbox') {
    listService.mainList.updateItems(inboxTasks.map((task) => task.id));
  } else {
    listService.setMainList(
      new TaskList(
        'Inbox',
        inboxTasks.map((task) => task.id),
        [],
        null,
        null
      )
    );
  }

  const setFocus = useCallback(() => {
    listService.mainList?.setFocus(true);
  }, [listService]);

  const clearFocus = useCallback(() => {
    listService.mainList?.setFocus(false);
  }, [listService]);

  useRegisterEvent(listService.mainList?.onListOperation, (event) => {
    switch (event.type) {
      case 'delete_item': {
        flushSync(() => {
          todoService.deleteItem(event.id);
        });
        if (event.focusItem) {
          listService.mainList?.select(event.focusItem, {
            multipleMode: false,
            offset: 99999,
            fireEditEvent: true,
          });
        }
        break;
      }
    }
  });

  useRegisterEvent(listService.mainList?.onCreateNewOne, (event) => {
    const newTaskId = flushSync(() => {
      return todoService.addTask({
        title: '',
        position: {
          type: 'afterElement',
          previousElementId: event.afterId,
        },
      });
    });
    listService.mainList?.select(newTaskId, {
      multipleMode: false,
      offset: 0,
      fireEditEvent: true,
    });
  });

  const mainList = listService.mainList;
  if (!mainList) {
    return null;
  }

  return (
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <div className="h-12 flex items-center justify-between px-4 border-b border-line-light bg-bg1">
          <div className="flex items-center gap-2">
            <InboxIcon className="size-5 text-t2" />
            <h1 className="text-lg font-medium text-t1">{localize('inbox', 'Inbox')}</h1>
          </div>
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-t2 hover:text-t1 hover:bg-bg2 rounded-md transition-colors"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              openTaskDisplaySettings(rect.right, rect.bottom + 4);
            }}
          >
            <TaskDisplaySettingsIcon className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 outline-none" tabIndex={1} onFocus={setFocus} onBlur={clearFocus}>
            {inboxTasks.map((task) => (
              <TaskListItem
                taskList={mainList}
                key={task.id}
                task={task}
                willDisappear={willDisappearObjectIdSet.has(task.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
