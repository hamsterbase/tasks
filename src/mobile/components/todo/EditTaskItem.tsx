import {
  AlarmIcon,
  BellIcon,
  CalendarIcon,
  FlagIcon,
  ListChecksIcon,
  MenuIcon,
  NotesIcon,
  Repeat2Icon,
  RepeatIcon,
  SubtaskIcon,
  TagIcon,
  DeleteIcon,
} from '@/components/icons';
import { mergeDateAndTime } from '@/core/time/mergeDateAndTime';
import { formatReminderTime } from '@/core/time/formatReminderTime';
import { recurringToString } from '@/core/time/recurringToString';
import { getTaskInfo } from '@/core/state/getTaskInfo';
import { TaskInfo } from '@/core/state/type';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useCancelEdit } from '@/hooks/useCancelEdit';
import { useEdit } from '@/hooks/useEdit';
import { useEditTaskHooks } from '@/hooks/useEditTask.tsx';
import { useLongPress } from '@/hooks/useLongPress';
import { SubtaskItem } from '@/mobile/components/todo/SubtaskItem';
import { useMobileDatepicker } from '@/mobile/overlay/datePicker/useDatepicker';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { useRecurringTaskSettings } from '@/mobile/overlay/recurringTaskSettings/useRecurringTaskSettings';
import { TagEditorActionSheetController } from '@/mobile/overlay/tagEditor/TagEditorActionSheetController';
import { useTimePicker } from '@/mobile/overlay/timePicker/useTimePicker';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { closestCenter, DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import TextArea from 'rc-textarea';
import React, { useRef } from 'react';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { OverlayItem } from '../dnd/DragOverlayItem';
import { AttrList, AttrRowItem } from '../attr/AttrList';
import { AttrContainer } from '../attr/AttrContainer';
import { TaskCheckbox } from '../icon/TaskCheckbox';

interface EditTaskItemProps {
  taskInfo: TaskInfo;
}

function formatDateISO(timestamp?: number): string {
  if (!timestamp) return '';
  return new Date(timestamp).toISOString().split('T')[0];
}

export const EditTaskItem: React.FC<EditTaskItemProps> = ({ taskInfo: taskInfoProp }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  // Get fresh taskInfo from service state to reflect latest changes (reminders, recurring, etc.)
  const taskInfo = getTaskInfo(todoService.modelState, taskInfoProp.id);
  const isEditing = taskInfo.id === todoService.editingContent?.id;
  const taskActions = useEditTaskHooks(taskInfo);
  useWatchEvent(todoService.onEditingContentChange, (data) => {
    return data === taskInfo.id;
  });

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const divRef = useRef<HTMLDivElement>(null);
  const { itemClassName, shouldIgnoreClick, endEditing } = useCancelEdit(divRef, taskInfo.id);
  const { textAreaProps } = useEdit({
    isEditing,
    title: taskInfo.title,
    onSave: (title: string) => {
      todoService.updateTask(taskInfo.id, { title });
    },
    singleLine: true,
    onConfirm: endEditing,
    disableAutoFocus: !!taskInfo.title,
  });
  const { textAreaProps: notesProps } = useEdit({
    isEditing,
    title: taskInfo.notes ?? '',
    onSave: (notes: string) => {
      todoService.updateTask(taskInfo.id, { notes });
    },
    singleLine: false,
    disableAutoFocus: true,
  });

  const popupAction = usePopupAction();
  const mobileDatepicker = useMobileDatepicker();
  const openRecurringTaskSettings = useRecurringTaskSettings();
  const timePicker = useTimePicker();
  const instantiationService = useService(IInstantiationService);

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    popupAction({
      groups: [
        {
          items: [
            {
              icon: <SubtaskIcon />,
              name: localize('edit_task_item.add_subtask', 'Add Subtask'),
              onClick: () => {
                taskActions.createSubtask();
              },
            },
            {
              icon: <AlarmIcon />,
              name: localize('edit_task_item.set_reminder', 'Set Reminder'),
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
            {
              icon: <RepeatIcon />,
              name: localize('task.recurring_settings', 'Recurring Settings'),
              onClick: () => {
                openRecurringTaskSettings(taskInfo.recurringRule || {}, (settings) => {
                  todoService.updateTask(taskInfo.id, { recurringRule: settings });
                });
              },
            },
            {
              icon: <TagIcon />,
              name: localize('edit_task_item.set_tags', 'Set Tags'),
              onClick: () => {
                TagEditorActionSheetController.create(
                  taskInfo.tags,
                  (tags) => {
                    todoService.updateTask(taskInfo.id, { tags });
                  },
                  instantiationService
                );
              },
            },
          ],
        },
        {
          items: [
            {
              icon: <DeleteIcon />,
              name: localize('edit_task_item.delete', 'Delete Task'),
              danger: true,
              onClick: () => {
                todoService.deleteItem(taskInfo.id);
              },
            },
          ],
        },
      ],
    });
  };

  const handleStartDateClick = () => {
    mobileDatepicker.showDatePicker({
      initialDate: taskInfo.startDate,
      onDateSelected: (ds) => {
        todoService.updateTask(taskInfo.id, { startDate: ds });
      },
    });
  };

  const handleDueDateClick = () => {
    mobileDatepicker.showDatePicker({
      initialDate: taskInfo.dueDate,
      onDateSelected: (date) => {
        todoService.updateTask(taskInfo.id, { dueDate: date });
      },
    });
  };

  const { longPressEvents } = useLongPress(() => {
    popupAction({
      groups: [
        {
          items: [
            {
              condition: taskInfo.status !== 'created',
              icon: <TaskCheckbox status={'created'} />,
              name: localize('tasks.mark_as_created', 'Mark as Created'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'created' });
              },
            },
            {
              condition: taskInfo.status !== 'completed',
              icon: <TaskCheckbox status={'completed'} />,
              name: localize('tasks.mark_as_completed', 'Mark as Completed'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'completed' });
              },
            },
            {
              condition: taskInfo.status !== 'canceled',
              icon: <TaskCheckbox status={'canceled'} />,
              name: localize('tasks.mark_as_canceled', 'Mark as Canceled'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'canceled' });
              },
            },
          ],
        },
      ],
    });
  });

  const attrRows: AttrRowItem[] = [
    {
      type: 'label',
      key: 'startDate',
      icon: <CalendarIcon className={styles.editTaskAttrIcon} />,
      placeholder: localize('edit_task_item.set_start_date', 'Set Start Date'),
      value: taskInfo.startDate ? { title: formatDateISO(taskInfo.startDate) } : undefined,
      onClick: handleStartDateClick,
      testId: 'edit-task-start-date',
      labelTitleColor: 'text-t2',
    },
    {
      type: 'label',
      key: 'dueDate',
      icon: <FlagIcon className={styles.editTaskAttrIcon} />,
      placeholder: localize('edit_task_item.set_due_date', 'Set Due Date'),
      value: taskInfo.dueDate ? { title: formatDateISO(taskInfo.dueDate) } : undefined,
      onClick: handleDueDateClick,
      testId: 'edit-task-due-date',
      labelTitleColor: 'text-t2',
    },
    ...(taskInfo.tags.length > 0
      ? [
          {
            type: 'tags' as const,
            key: 'tags',
            icon: <TagIcon className={styles.editTaskAttrIcon} />,
            placeholder: localize('edit_task_item.set_tags', 'Set Tags'),
            tags: taskInfo.tags,
            onClick: () => {
              TagEditorActionSheetController.create(
                taskInfo.tags,
                (tags) => {
                  todoService.updateTask(taskInfo.id, { tags });
                },
                instantiationService
              );
            },
          },
        ]
      : []),
    ...(taskInfo.children.length > 0
      ? [
          {
            type: 'tasks' as const,
            key: 'subtasks',
            icon: <ListChecksIcon className={styles.editTaskAttrIcon} />,
            children: (
              <>
                <div className={styles.editingTaskSubtaskHeader}>
                  <span>
                    {`${taskInfo.children.filter((c) => c.status === 'completed' || c.status === 'canceled').length} / ${taskInfo.children.length}`}
                  </span>
                  <div className={styles.editingTaskSubtaskProgressBar}>
                    <div
                      className={styles.editingTaskSubtaskProgressFill}
                      style={{
                        width: `${(taskInfo.children.filter((c) => c.status === 'completed' || c.status === 'canceled').length / taskInfo.children.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={taskActions.handleDragEnd}>
                  <SortableContext
                    items={taskInfo.children.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <OverlayItem isSubtask={true} className={styles.editingTaskSubtaskOverlay} />
                    {taskInfo.children.map((child) => (
                      <SubtaskItem
                        key={child.id}
                        id={child.id}
                        title={child.title}
                        status={child.status}
                        className={styles.createTaskSubtaskItem}
                        onStatusChange={taskActions.updateSubtaskStatus}
                        onTitleChange={taskActions.updateSubtaskTitle}
                        onCreate={() => taskActions.createSubtask(child.id)}
                        onDelete={taskActions.deleteSubtask}
                        inputRef={(el: HTMLInputElement | null) => {
                          if (el) taskActions.subtaskInputRefs.current[child.id] = el;
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </>
            ),
          },
        ]
      : []),
    {
      hidden: taskInfo.reminders.length === 0,
      type: 'interactive' as const,
      key: 'reminders',
      icon: <BellIcon className={styles.editTaskAttrIcon} />,
      placeholder: localize('edit_task_item.set_reminder', 'Set Reminder'),
      items: [...taskInfo.reminders]
        .sort((a, b) => a.time - b.time)
        .map((reminder) => {
          const { date, time } = formatReminderTime(reminder.time);
          return { title: date, subtitle: time };
        }),
      testId: 'edit-task-reminders',
      onLabelClick: (index: number) => {
        const sorted = [...taskInfo.reminders].sort((a, b) => a.time - b.time);
        const reminder = sorted[index];
        if (!reminder) return;
        mobileDatepicker.showDatePicker({
          initialDate: reminder.time,
          onDateSelected: async (date) => {
            const time = await timePicker.showTimePickerPromise(reminder.time);
            const mergedDateTime = mergeDateAndTime(date, time);
            todoService.updateReminder(reminder.reminderId, { time: mergedDateTime.getTime() });
          },
        });
      },
      onRemove: (index: number) => {
        const sorted = [...taskInfo.reminders].sort((a, b) => a.time - b.time);
        const reminder = sorted[index];
        if (reminder) {
          todoService.deleteReminder(reminder.reminderId);
        }
      },
      onAdd: () => {
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
    (() => {
      const recurringItems: { type: 'startDate' | 'dueDate'; title: string; subtitle: string }[] = [];
      if (taskInfo.recurringRule?.startDate) {
        recurringItems.push({
          type: 'startDate',
          title: localize('tasks.start_date_label', 'Start Date'),
          subtitle: recurringToString(taskInfo.recurringRule.startDate),
        });
      }
      if (taskInfo.recurringRule?.dueDate) {
        recurringItems.push({
          type: 'dueDate',
          title: localize('tasks.due_date_label', 'Due Date'),
          subtitle: recurringToString(taskInfo.recurringRule.dueDate),
        });
      }
      return {
        hidden: recurringItems.length === 0,
        type: 'interactive' as const,
        key: 'recurring',
        icon: <Repeat2Icon className={styles.editTaskAttrIcon} />,
        placeholder: localize('task.recurring_settings', 'Recurring Settings'),
        items: recurringItems.map(({ title, subtitle }) => ({ title, subtitle })),
        testId: 'edit-task-recurring',
        onLabelClick: (index: number) => {
          const item = recurringItems[index];
          if (!item) return;
          const currentRule = taskInfo.recurringRule || {};
          openRecurringTaskSettings(currentRule, (settings) => {
            todoService.updateTask(taskInfo.id, { recurringRule: settings });
          });
        },
        onRemove: (index: number) => {
          const item = recurringItems[index];
          if (!item) return;
          const currentRule = { ...taskInfo.recurringRule };
          if (item.type === 'startDate') {
            delete currentRule.startDate;
          } else {
            delete currentRule.dueDate;
          }
          todoService.updateTask(taskInfo.id, { recurringRule: currentRule });
        },
        onAdd: () => {
          openRecurringTaskSettings(taskInfo.recurringRule || {}, (settings) => {
            todoService.updateTask(taskInfo.id, { recurringRule: settings });
          });
        },
      };
    })(),
  ];

  return (
    <div
      ref={divRef}
      onClick={shouldIgnoreClick}
      className={classNames(
        styles.taskItemPaddingX,
        styles.listItemEditingBackground,
        styles.taskItemEditingShadow,
        styles.taskItemEditingRound,
        itemClassName,
        styles.editTaskItemRootPaddingY
      )}
    >
      {/* Title row */}
      <div className={styles.createTaskAttrRow}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            taskActions.toggleTask();
          }}
          {...longPressEvents}
          className={styles.editTaskItemStatusButton}
        >
          <TaskCheckbox status={taskInfo.status} />
        </button>
        <div className={styles.editTaskItemContent}>
          <div className={styles.editTaskItemTitleInputRow}>
            <TextArea
              {...textAreaProps}
              ref={(el) => {
                if (el) {
                  textAreaProps.ref.current = el.nativeElement as HTMLInputElement;
                }
              }}
              autoSize={{ minRows: 1 }}
              className={styles.editTaskItemTitleInput}
            />
          </div>
        </div>
        <button data-testid="edit-task-menu-button" className={styles.editTaskItemMenuButton} onClick={handleMenuClick}>
          <MenuIcon className={styles.projectHeadingItemMenuIcon} />
        </button>
      </div>

      {/* Expanded content */}
      <div className={styles.editTaskItemExpanded}>
        <div className={styles.editTaskItemExpandedOverflow}>
          <div className={styles.editTaskItemExpandedRow}>
            <div className={styles.editTaskItemExpandedSpacer}></div>
            <div className={styles.editTaskItemExpandedContent}>
              <AttrContainer icon={<NotesIcon className={styles.editTaskAttrIcon} />}>
                <TextArea
                  {...notesProps}
                  ref={(el) => {
                    if (el) {
                      notesProps.ref.current = el.nativeElement as HTMLInputElement;
                    }
                  }}
                  className={styles.createTaskNotesTextarea}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  placeholder={localize('edit_task_item.task_notes_placeholder', 'Add Notes')}
                />
              </AttrContainer>
              <AttrList items={attrRows} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
