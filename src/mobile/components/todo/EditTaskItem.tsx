import {
  AlarmIcon,
  BellIcon,
  CalendarIcon,
  FlagIcon,
  ListChecksIcon,
  MenuIcon,
  MoveIcon,
  NotesIcon,
  Repeat2Icon,
  RepeatIcon,
  SubtaskIcon,
  TagIcon,
  DeleteIcon,
} from '@/components/icons';
import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { getTaskInfo } from '@/core/state/getTaskInfo';
import { TaskInfo } from '@/core/state/type';
import { formatReminderTime } from '@/core/time/formatReminderTime';
import { mergeDateAndTime } from '@/core/time/mergeDateAndTime';
import { recurringToString } from '@/core/time/recurringToString';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useEdit } from '@/hooks/useEdit';
import { useEditTaskHooks } from '@/hooks/useEditTask.tsx';
import { useMobileDatepicker } from '@/mobile/overlay/datePicker/useDatepicker';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { useProjectAreaSelector } from '@/mobile/overlay/projectAreaSelector/useProjectAreaSelector';
import { useRecurringTaskSettings } from '@/mobile/overlay/recurringTaskSettings/useRecurringTaskSettings';
import { TagEditorActionSheetController } from '@/mobile/overlay/tagEditor/TagEditorActionSheetController';
import { useTimePicker } from '@/mobile/overlay/timePicker/useTimePicker';
import { MobileTestIds } from '@/mobile/testids';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import { TreeID } from 'loro-crdt';
import TextArea from 'rc-textarea';
import React from 'react';
import { flushSync } from 'react-dom';
import { useLocation } from 'react-router';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { AttrContainer } from '../attr/AttrContainer';
import { AttrList, AttrRowItem } from '../attr/AttrList';
import { EditTaskSubtasks } from './EditTaskSubtasks';
import { TaskStatusButton } from './TaskStatusButton';

interface EditTaskItemProps {
  taskInfo: TaskInfo;
  expanded: boolean;
  expandRef?: React.Ref<HTMLDivElement>;
  /** 收起过渡进行中：标题行立即换回展示态，仅下方扩展区继续播放收起动画 */
  closing?: boolean;
  collapsedRow?: React.ReactNode;
  onCollapseTransitionEnd: React.TransitionEventHandler<HTMLDivElement>;
}

function formatDateISO(timestamp?: number): string {
  if (!timestamp) return '';
  return new Date(timestamp).toISOString().split('T')[0];
}

export const EditTaskItem: React.FC<EditTaskItemProps> = ({
  taskInfo: taskInfoProp,
  expanded,
  expandRef,
  closing = false,
  collapsedRow,
  onCollapseTransitionEnd,
}) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  // Get fresh taskInfo from service state to reflect latest changes (reminders, recurring, etc.)
  const taskInfo = getTaskInfo(todoService.modelState, taskInfoProp.id);
  const isEditing = taskInfo.id === todoService.editingContent?.id;
  const taskActions = useEditTaskHooks(taskInfo);
  useWatchEvent(todoService.onEditingContentChange, (data) => {
    return data === taskInfo.id;
  });

  const location = useLocation();
  const createTaskAfterCurrent = React.useCallback(() => {
    todoService.endEditingContent();
    const position = { type: 'afterElement' as const, previousElementId: taskInfo.id };
    const isToday = location.pathname === '/today';
    const newTaskId = flushSync(() => {
      const id = todoService.addTask({
        title: '',
        position,
        ...(isToday ? { startDate: getTodayTimestampInUtc() } : {}),
      });
      if (isToday) {
        todoService.moveDateAssignedList(id, position);
      }
      return id;
    });
    todoService.editItem(newTaskId);
  }, [location.pathname, taskInfo.id, todoService]);
  const { textAreaProps } = useEdit({
    isEditing,
    title: taskInfo.title,
    onSave: (title: string) => {
      todoService.updateTask(taskInfo.id, { title });
    },
    singleLine: true,
    onConfirm: createTaskAfterCurrent,
    enterKeyHint: 'next',
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
  const projectAreaSelector = useProjectAreaSelector();

  const handleAddReminder = () => {
    mobileDatepicker.showDatePicker({
      initialDate: Date.now(),
      onDateSelected: async (date) => {
        const time = await timePicker.showTimePickerPromise(Date.now());
        const mergedDateTime = mergeDateAndTime(date, time);
        todoService.addReminder({ itemId: taskInfo.id, time: mergedDateTime.getTime() });
      },
    });
  };

  const handleEditTags = () => {
    TagEditorActionSheetController.create(
      taskInfo.tags,
      (tags) => {
        todoService.updateTask(taskInfo.id, { tags });
      },
      instantiationService
    );
  };

  const handleEditRecurring = () => {
    openRecurringTaskSettings(taskInfo.recurringRule || {}, (settings) => {
      todoService.updateTask(taskInfo.id, { recurringRule: settings });
    });
  };

  const handleMoveTask = () => {
    projectAreaSelector({
      currentItemId: taskInfo.id,
      onConfirm: (id: TreeID | null) => {
        todoService.updateTask(taskInfo.id, {
          position: {
            type: 'firstElement',
            parentId: id ?? undefined,
          },
        });
      },
    });
  };

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
              onClick: handleAddReminder,
            },
            {
              icon: <RepeatIcon />,
              name: localize('task.recurring_settings', 'Recurring Settings'),
              onClick: handleEditRecurring,
            },
            {
              icon: <TagIcon />,
              name: localize('edit_task_item.set_tags', 'Set Tags'),
              onClick: handleEditTags,
            },
            {
              icon: <MoveIcon />,
              name: localize('task.move', 'Move Task'),
              onClick: handleMoveTask,
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
            onClick: handleEditTags,
          },
        ]
      : []),
    ...(taskInfo.children.length > 0
      ? [
          {
            type: 'tasks' as const,
            key: 'subtasks',
            icon: <ListChecksIcon className={styles.editTaskAttrIcon} />,
            children: <EditTaskSubtasks taskInfo={taskInfo} taskActions={taskActions} />,
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
      onAdd: handleAddReminder,
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
          handleEditRecurring();
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
        onAdd: handleEditRecurring,
      };
    })(),
  ];

  return (
    <>
      {/* Title row: swaps back to the display row as soon as the item starts closing */}
      {closing ? (
        collapsedRow
      ) : (
        <div className={styles.createTaskAttrRow}>
          <TaskStatusButton taskId={taskInfo.id} status={taskInfo.status} className={styles.editTaskItemStatusButton} />
          <div className={styles.editTaskItemContent}>
            <div className={styles.editTaskItemTitleInputRow}>
              <TextArea
                {...textAreaProps}
                data-testid={MobileTestIds.EditTaskItem.TitleInput}
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
          <button
            data-testid={MobileTestIds.EditTaskItem.MenuButton}
            className={styles.editTaskItemMenuButton}
            onClick={handleMenuClick}
          >
            <MenuIcon className={styles.projectHeadingItemMenuIcon} />
          </button>
        </div>
      )}

      {/* Expanded content, height-animated via grid-template-rows */}
      <div
        ref={expandRef}
        className={classNames(
          styles.editTaskItemExpanded,
          styles.taskItemExpandDuration,
          expanded ? styles.editTaskItemExpandedOpen : styles.editTaskItemExpandedClosed
        )}
        onTransitionEnd={onCollapseTransitionEnd}
      >
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
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  placeholder={localize('edit_task_item.task_notes_placeholder', 'Add Notes')}
                />
              </AttrContainer>
              <AttrList items={attrRows} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
