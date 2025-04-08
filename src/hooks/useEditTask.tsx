import { DeleteIcon, DueIcon, MoveIcon, ScheduledIcon, SubtaskIcon, TagIcon } from '@/components/icons';
import { TaskInfo } from '@/core/state/type';
import { ItemStatus } from '@/core/type';
import { ProjectStatusBox } from '@/mobile/components/taskItem/ProjectStatusBox';
import { DatePickerActionSheetController } from '@/mobile/overlay/datePicker/DatePickerActionSheetController';
import { useDialog } from '@/mobile/overlay/dialog/useDialog';
import { PopupActionItem } from '@/mobile/overlay/popupAction/PopupActionController';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { TagEditorActionSheetController } from '@/mobile/overlay/tagEditor/TagEditorActionSheetController';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { DragEndEvent } from '@dnd-kit/core';
import { TreeID } from 'loro-crdt';
import React, { useRef } from 'react';
import { useService } from './use-service';
import { useWatchEvent } from './use-watch-event';
import { StartDateInfoItem } from '@/mobile/components/infoItem/startDate';
import { DueDateInfoItem, DueDateInfoItemIcon } from '@/mobile/components/infoItem/dueDate';
import { useProjectAreaSelector } from '@/mobile/overlay/projectAreaSelector/useProjectAreaSelector';

export const useEditTaskHooks = (taskInfo: TaskInfo) => {
  const subtaskInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const popupAction = usePopupAction();
  const dialog = useDialog();
  const projectAreaSelector = useProjectAreaSelector();
  const instantiationService = useService(IInstantiationService);

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
              onConfirm: (id) => {
                console.log('move', id);
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
        return new Promise<void>((resolve) => {
          DatePickerActionSheetController.create(
            taskInfo.startDate,
            (ds) => {
              todoService.updateTask(taskInfo.id, { startDate: ds });
              resolve();
            },
            instantiationService
          );
        });
      },
    },
    {
      key: 'dueDate',
      show: !taskInfo.dueDate,
      icon: <DueIcon className={styles.taskDetailBottomActionIconStyle} />,
      onClick: () => {
        return new Promise<void>((resolve) => {
          DatePickerActionSheetController.create(
            taskInfo.dueDate,
            (ds) => {
              todoService.updateTask(taskInfo.id, { dueDate: ds });
              resolve();
            },
            instantiationService
          );
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
        DatePickerActionSheetController.create(
          taskInfo.startDate,
          (ds) => {
            todoService.updateTask(taskInfo.id, { startDate: ds });
          },
          instantiationService
        );
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
        DatePickerActionSheetController.create(
          taskInfo.dueDate,
          (ds) => {
            todoService.updateTask(taskInfo.id, { dueDate: ds });
          },
          instantiationService
        );
      },
      onClear: () => {
        todoService.updateTask(taskInfo.id, { dueDate: null });
        todoService.editItem(taskInfo.id);
      },
    },
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
