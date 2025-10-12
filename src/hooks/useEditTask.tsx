import { mergeDateAndTime } from '@/base/common/time';
import {
  AlarmIcon,
  DeleteIcon,
  DueIcon,
  MoveIcon,
  RepeatIcon,
  ScheduledIcon,
  SubtaskIcon,
  TagIcon,
} from '@/components/icons';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox.tsx';
import { TaskInfo } from '@/core/state/type';
import { recurringToString } from '@/core/time/recurringToString';
import { ItemStatus, RecurringRule } from '@/core/type';
import { DueDateInfoItem, DueDateInfoItemIcon } from '@/mobile/components/infoItem/dueDate';
import { ReminderTimeInfoItem } from '@/mobile/components/infoItem/reminderTime';
import { StartDateInfoItem } from '@/mobile/components/infoItem/startDate';
import { useMobileDatepicker } from '@/mobile/overlay/datePicker/useDatepicker';
import { useDialog } from '@/mobile/overlay/dialog/useDialog';
import { PopupActionItem } from '@/mobile/overlay/popupAction/PopupActionController';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { useProjectAreaSelector } from '@/mobile/overlay/projectAreaSelector/useProjectAreaSelector';
import { useRecurringTaskSettings } from '@/mobile/overlay/recurringTaskSettings/useRecurringTaskSettings';
import { TagEditorActionSheetController } from '@/mobile/overlay/tagEditor/TagEditorActionSheetController';
import { useTimePicker } from '@/mobile/overlay/timePicker/useTimePicker';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { DragEndEvent } from '@dnd-kit/core';
import { TreeID } from 'loro-crdt';
import React, { useRef } from 'react';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { useService } from './use-service';
import { useWatchEvent } from './use-watch-event';

function formatRecurringRule(rule?: RecurringRule): string[] {
  if (!rule) {
    return [];
  }

  const parts: string[] = [];

  if (rule.startDate) {
    parts.push(localize('tasks.recurring_start_date', 'StartDate: {0}', recurringToString(rule.startDate)));
  }

  if (rule.dueDate) {
    parts.push(localize('tasks.recurring_due_date', 'DueDate: {0}', recurringToString(rule.dueDate)));
  }

  return parts;
}

export const useEditTaskHooks = (taskInfo: TaskInfo) => {
  const subtaskInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const popupAction = usePopupAction();
  const dialog = useDialog();
  const projectAreaSelector = useProjectAreaSelector();
  const instantiationService = useService(IInstantiationService);
  const mobileDatepicker = useMobileDatepicker();
  const openRecurringTaskSettings = useRecurringTaskSettings();

  const timePicker = useTimePicker();

  const handleDeleteTask = () => {
    dialog({
      title: localize('task.delete_task', 'Delete Task'),
      description: localize('task.delete_task_description', 'Are you sure you want to delete this task?'),
      confirmText: localize('task.delete', 'Delete'),
      onConfirm: () => {
        todoService.deleteItem(taskInfo.id);
        todoService.endEditingContent();
      },
      onCancel: () => {},
    });
  };

  const handleMoreOptions = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    popupAction({
      items: [
        {
          icon: <RepeatIcon />,
          name: localize('task.set_recurring', 'Recurring Config'),
          onClick: () => {
            openRecurringTaskSettings(taskInfo.recurringRule || {}, (settings) => {
              todoService.updateTask(taskInfo.id, {
                recurringRule: settings,
              });
            });
          },
        },
        {
          icon: <DeleteIcon />,
          name: localize('task.delete_task', 'Delete Task'),
          onClick: handleDeleteTask,
        },
        {
          icon: <ProjectStatusBox status={'created'} progress={0.6} />,
          name: localize('task.convert_to_project', 'Convert to Project'),
          onClick: handleConvertToProject,
        },
        {
          icon: <MoveIcon />,
          name: localize('task.move', 'Move'),
          onClick: () => {
            projectAreaSelector({
              currentItemId: taskInfo.id,
              onConfirm: (id: TreeID | null) => {
                if (!id) {
                  todoService.updateTask(taskInfo.id, {
                    position: { type: 'firstElement' },
                  });
                  return;
                }
                todoService.updateTask(taskInfo.id, { parentId: id as TreeID });
              },
            });
          },
        },
      ] as PopupActionItem[],
    });
  };

  const handleConvertToProject = () => {
    dialog({
      title: localize('task.convert_to_project', 'Convert to Project'),
      description: localize(
        'task.convert_to_project_description',
        'Are you sure you want to convert this task to a project?'
      ),
      confirmText: localize('task.convert', 'Convert'),
      onConfirm: () => {
        todoService.endEditingContent();
        todoService.covertToProject(taskInfo.id);
      },
      onCancel: () => {},
    });
  };

  const bottomActions = [
    {
      key: 'startDate',
      show: !taskInfo.startDate,
      icon: <ScheduledIcon className={styles.taskDetailBottomActionIconStyle} />,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: taskInfo.startDate,
          onDateSelected: (ds) => {
            todoService.updateTask(taskInfo.id, { startDate: ds });
          },
        });
      },
    },
    {
      key: 'dueDate',
      show: !taskInfo.dueDate,
      icon: <DueIcon className={styles.taskDetailBottomActionIconStyle} />,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: taskInfo.dueDate,
          onDateSelected: (date) => {
            todoService.updateTask(taskInfo.id, { dueDate: date });
          },
        });
      },
    },
    {
      key: 'tags',
      show: taskInfo.tags.length === 0,
      icon: <TagIcon className={styles.taskDetailBottomActionIconStyle} />,
      onClick: () => {
        return new Promise<void>((resolve) => {
          TagEditorActionSheetController.create(
            taskInfo.tags,
            (tags) => {
              todoService.updateTask(taskInfo.id, { tags });
              resolve();
            },
            instantiationService
          );
        });
      },
    },
    {
      key: 'subtask',
      show: taskInfo.children.length === 0,
      icon: <SubtaskIcon className={styles.taskDetailBottomActionIconStyle} />,
      onClick: () => {
        createSubtask();
        return Promise.resolve();
      },
    },
    {
      key: 'reminder',
      show: true,
      icon: <AlarmIcon className={styles.taskDetailBottomActionIconStyle} />,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: Date.now(),
          onDateSelected: async (date) => {
            const time = await timePicker.showTimePickerPromise(Date.now());
            const mergedDateTime = mergeDateAndTime(date, time);
            todoService.addReminder({ itemId: taskInfo.id, time: mergedDateTime.getTime() });
          },
        });
      },
    },
  ].filter((action) => action.show);

  const createSubtask = (previousTaskId?: TreeID) => {
    let newTaskId;
    if (previousTaskId) {
      newTaskId = todoService.addTask({
        title: '',
        position: { type: 'afterElement', previousElementId: previousTaskId },
      });
    } else {
      newTaskId = todoService.addTask({
        title: '',
        position: { type: 'firstElement', parentId: taskInfo.id },
      });
    }

    // Focus the new subtask input after creation
    setTimeout(() => {
      if (subtaskInputRefs.current[newTaskId]) {
        subtaskInputRefs.current[newTaskId].focus();
      }
    }, 0);

    todoService.editItem(taskInfo.id);
  };

  const deleteSubtask = (id: string) => {
    let toFocusId = '';
    const currentIndex = taskInfo.children.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;
    if (currentIndex === 0) {
      toFocusId = taskInfo.children[1].id;
    } else {
      toFocusId = taskInfo.children[currentIndex - 1].id;
    }
    todoService.deleteItem(id);
    if (subtaskInputRefs.current[toFocusId]) {
      subtaskInputRefs.current[toFocusId].focus();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!taskInfo.children) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = taskInfo.children.findIndex((item) => item.id === active.id);
    const newIndex = taskInfo.children.findIndex((item) => item.id === over.id);

    if (oldIndex === newIndex) return;

    let previousTaskId: TreeID | undefined;
    if (newIndex === 0) {
      previousTaskId = undefined;
    } else if (newIndex > oldIndex) {
      previousTaskId = taskInfo.children[newIndex].id;
    } else {
      previousTaskId = taskInfo.children[newIndex - 1].id;
    }

    const taskId = taskInfo.children[oldIndex].id;

    if (!previousTaskId) {
      todoService.updateTask(taskId, {
        position: { type: 'firstElement', parentId: taskInfo.id },
      });
    } else {
      todoService.updateTask(taskId, {
        position: { type: 'afterElement', previousElementId: previousTaskId },
      });
    }

    todoService.editItem(taskInfo.id);
  };

  const updateSubtaskStatus = (id: string, status: ItemStatus) => {
    todoService.updateTask(id as TreeID, { status });
  };

  const updateSubtaskTitle = (id: string, title: string) => {
    todoService.updateTask(id as TreeID, { title });
  };

  const toggleTask = () => {
    if (taskInfo.status !== 'created') {
      todoService.updateTask(taskInfo.id, { status: 'created' });
    } else {
      todoService.updateTask(taskInfo.id, { status: 'completed' });
    }
  };

  const reminders = taskInfo.reminders.map((reminder) => {
    return {
      itemKey: 'reminder' + reminder.reminderId,
      show: true,
      icon: <AlarmIcon></AlarmIcon>,
      content: <ReminderTimeInfoItem reminderTime={reminder.time}></ReminderTimeInfoItem>,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: reminder.time,
          onDateSelected: async (date) => {
            const time = await timePicker.showTimePickerPromise(reminder.time);
            const mergedDateTime = mergeDateAndTime(date, time);
            todoService.updateReminder(reminder.reminderId, { time: mergedDateTime.getTime() });
          },
        });
      },
      onClear: () => {
        todoService.deleteReminder(reminder.reminderId);
      },
    };
  });

  const recurringRuleDisplay = formatRecurringRule(taskInfo.recurringRule);

  const taskDetailItems = [
    {
      itemKey: 'tags',
      show: taskInfo.tags.length > 0,
      icon: <TagIcon className="text-t2" />,
      content: (
        <div className="flex flex-wrap gap-2">
          {taskInfo.tags.map((tag) => (
            <span key={tag} className="text-sm text-brand font-medium">
              #{tag}
            </span>
          ))}
        </div>
      ),
      onClick: () => {
        TagEditorActionSheetController.create(
          taskInfo.tags,
          (tags) => {
            todoService.updateTask(taskInfo.id, { tags });
          },
          instantiationService
        );
      },
      onClear: undefined,
    },
    {
      itemKey: 'startDate',
      show: !!taskInfo.startDate,
      icon: <ScheduledIcon />,
      content: <StartDateInfoItem startDate={taskInfo.startDate} />,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: taskInfo.startDate,
          onDateSelected: (ds) => {
            todoService.updateTask(taskInfo.id, { startDate: ds });
          },
        });
      },
      onClear: () => {
        todoService.updateTask(taskInfo.id, { startDate: null });
      },
    },
    {
      itemKey: 'dueDate',
      show: !!taskInfo.dueDate,
      icon: <DueDateInfoItemIcon dueDate={taskInfo.dueDate} />,
      content: <DueDateInfoItem dueDate={taskInfo.dueDate} />,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: taskInfo.dueDate,
          onDateSelected: (ds) => {
            todoService.updateTask(taskInfo.id, { dueDate: ds });
          },
        });
      },
      onClear: () => {
        todoService.updateTask(taskInfo.id, { dueDate: null });
        todoService.editItem(taskInfo.id);
      },
    },
    {
      itemKey: 'recurring',
      show: recurringRuleDisplay.length > 0,
      icon: <RepeatIcon />,
      content: (
        <div className="flex flex-col gap-1">
          {recurringRuleDisplay.map((text) => (
            <span key={text} className="text-sm text-t2">
              {text}
            </span>
          ))}
        </div>
      ),
      onClick: () => {
        openRecurringTaskSettings(taskInfo.recurringRule || {}, (settings) => {
          todoService.updateTask(taskInfo.id, {
            recurringRule: settings,
          });
        });
      },
      onClear: () => {
        todoService.updateTask(taskInfo.id, { recurringRule: undefined });
      },
    },
    ...reminders,
  ];

  return {
    toggleTask,
    createSubtask,
    handleDragEnd,
    deleteSubtask,
    subtaskInputRefs,
    handleMoreOptions,
    bottomActions,
    updateSubtaskStatus,
    updateSubtaskTitle,
    taskDetailItems,
  };
};
