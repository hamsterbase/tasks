import { mergeDateAndTime } from '@/base/common/time';
import { AlarmIcon, DueIcon, ScheduledIcon, SubtaskIcon, TagIcon } from '@/components/icons';
import { useBack } from '@/hooks/useBack';
import { useCreateTask } from '@/hooks/useCreateTask';
import { useDragSensors } from '@/hooks/useDragSensors';
import { localize } from '@/nls';
import { closestCenter, DndContext, DragEndEvent, Modifier } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import dayjs from 'dayjs';
import TextArea from 'rc-textarea';
import React, { useLayoutEffect, useRef } from 'react';
import { InfoItemGroup, InfoItemProps } from '../components/InfoItem';
import { DueDateInfoItem, DueDateInfoItemIcon } from '../components/infoItem/dueDate';
import { StartDateInfoItem } from '../components/infoItem/startDate';
import { InfoItemTags } from '../components/infoItem/tags';
import { SubtaskItem } from '../components/todo/SubtaskItem';
import { useMobileDatepicker } from '../overlay/datePicker/useDatepicker';
import { useTagEditor } from '../overlay/tagEditor/useTagEditor';
import { useTimePicker } from '../overlay/timePicker/useTimePicker';
import { styles } from '../theme';

const restrictToVerticalAxis: Modifier = ({ transform, ...res }) => {
  if (!res.containerNodeRect || !res.draggingNodeRect) return { ...transform, x: 0 };

  const maxY = res.containerNodeRect.bottom - res.draggingNodeRect.bottom;
  const minY = res.containerNodeRect.top - res.draggingNodeRect.top;

  return {
    ...transform,
    x: 0,
    y: Math.min(Math.max(transform?.y ?? 0, minY), maxY),
  };
};

const componentStyle = {
  confirmButtonColor: classNames(
    styles.createTaskPageButtonStyle,
    styles.createTaskPageConfirmButtonColor,
    styles.screenEdgePadding
  ),
  cancelButtonColor: classNames(
    styles.createTaskPageButtonStyle,
    styles.createTaskPageCancelButtonColor,
    styles.screenEdgePadding
  ),
};

export const CreateTaskActionSheet: React.FC = () => {
  const taskManager = useCreateTask();
  const sensors = useDragSensors();
  const titleRef = useRef<HTMLInputElement>(null);
  const subtaskInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const mobileDatepicker = useMobileDatepicker();
  const tagEditor = useTagEditor();
  const timePicker = useTimePicker();

  useLayoutEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
      setTimeout(() => {
        titleRef.current?.focus();
        titleRef.current?.select();
      }, 20);
    }
  }, []);

  useLayoutEffect(() => {
    taskManager.setFocusSubtaskCallback((newTaskId) => {
      setTimeout(() => {
        const input = subtaskInputRefs.current[newTaskId];
        if (input) {
          input.focus();
        }
      }, 0);
    });
  }, [taskManager]);

  const toolBarOptions = [
    {
      visible: !taskManager.startDate,
      icon: <ScheduledIcon />,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: taskManager.startDate,
          onDateSelected: (date) => {
            taskManager.updateStartDate(date);
          },
        });
      },
    },
    {
      visible: !taskManager.dueDate,
      icon: <DueIcon />,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: taskManager.dueDate,
          onDateSelected: (date) => {
            taskManager.updateDueDate(date);
          },
        });
      },
    },
    {
      visible: taskManager.tags.length === 0,
      icon: <TagIcon />,
      onClick: () => {
        tagEditor(taskManager.tags, (tags) => {
          taskManager.updateTags(tags);
        });
      },
    },
    {
      visible: taskManager.subtasks.length === 0,
      icon: <SubtaskIcon />,
      onClick: () => taskManager.createSubtask(),
    },
    {
      visible: taskManager.reminders.length === 0,
      icon: <AlarmIcon />,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: Date.now(),
          onDateSelected: async (date) => {
            const time = await timePicker.showTimePickerPromise(Date.now());
            const mergedDateTime = mergeDateAndTime(date, time);
            taskManager.addReminder(mergedDateTime.getTime());
          },
        });
      },
    },
  ];

  function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = array.slice();
    newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);

    return newArray;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = taskManager.subtasks.findIndex((item) => item.id === active.id);
    const newIndex = taskManager.subtasks.findIndex((item) => item.id === over.id);
    taskManager.updateSubtaskOrder(arrayMove(taskManager.subtasks, oldIndex, newIndex));
  };

  const goBack = useBack();
  function onCancel() {
    goBack();
  }

  function onConfirm() {
    taskManager.confirmTask();
    goBack();
  }

  const taskDetailItems: InfoItemProps[] = [
    {
      itemKey: 'tags',
      show: taskManager.tags && taskManager.tags.length > 0,
      icon: <TagIcon />,
      content: <InfoItemTags tags={taskManager.tags} />,
      onClick: () => {
        tagEditor(taskManager.tags, (tags) => {
          taskManager.updateTags(tags);
        });
      },
      onClear: () => taskManager.updateTags([]),
    },
    {
      itemKey: 'startDate',
      show: !!taskManager.startDate,
      icon: <ScheduledIcon />,
      content: <StartDateInfoItem startDate={taskManager.startDate} />,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: taskManager.startDate,
          onDateSelected: (date) => {
            taskManager.updateStartDate(date);
          },
        });
      },
      onClear: () => taskManager.clearStartDate(),
    },
    {
      itemKey: 'dueDate',
      show: !!taskManager.dueDate,
      icon: <DueDateInfoItemIcon dueDate={taskManager.dueDate} />,
      content: <DueDateInfoItem dueDate={taskManager.dueDate} />,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: taskManager.dueDate,
          onDateSelected: (date) => {
            taskManager.updateDueDate(date);
          },
        });
      },
      onClear: () => taskManager.clearDueDate(),
    },
    // Map reminders to InfoItemProps
    ...taskManager.reminders.map((reminder) => ({
      itemKey: `reminder-${reminder.id}`,
      show: true,
      icon: <AlarmIcon />,
      content: <div>{dayjs(reminder.time).format('YYYY-MM-DD HH:mm')}</div>,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: reminder.time,
          onDateSelected: async (date) => {
            const time = await timePicker.showTimePickerPromise(reminder.time);
            const mergedDateTime = mergeDateAndTime(date, time);
            taskManager.updateReminder(reminder.id, mergedDateTime.getTime());
          },
        });
      },
      onClear: () => taskManager.deleteReminder(reminder.id),
    })),
  ];

  return (
    <div className={classNames(styles.createTaskPageStyle)}>
      <div className={classNames(styles.createTaskPageHeaderStyle)}>
        <button onClick={onCancel} className={componentStyle.cancelButtonColor}>
          {localize('create_task_page.cancel', 'Cancel')}
        </button>
        <h2 className={classNames(styles.createTaskPageTitleStyle)}>
          {localize('create_task_page.title', 'Create Task')}
        </h2>
        <button onClick={onConfirm} className={componentStyle.confirmButtonColor}>
          {localize('create_task_page.confirm', 'Confirm')}
        </button>
      </div>
      <div className={classNames('flex flex-col', styles.createTaskPageContentGap, styles.screenEdgePadding)}>
        <div
          className={classNames('flex justify-start', styles.createTaskToolbarGap, {
            hidden: toolBarOptions.every((option) => !option.visible),
          })}
        >
          {toolBarOptions
            .filter((option) => option.visible)
            .map((option, index) => (
              <button key={index} onClick={option.onClick} className={styles.createTaskToolbarStyle}>
                <span className={styles.createTaskToolbarIconStyle}>{option.icon}</span>
              </button>
            ))}
        </div>
        <input
          ref={titleRef}
          autoFocus
          value={taskManager.title}
          onChange={(e) => taskManager.updateTitle(e.target.value)}
          placeholder={localize('create_sask_action_sheet.task_title_placeholder', 'Task Title')}
          className={`${styles.inputItemStyle}`}
          autoComplete="new-password"
        />
        <TextArea
          value={taskManager.notes}
          onChange={(e) => taskManager.updateNotes(e.target.value)}
          placeholder={localize('create_sask_action_sheet.task_notes_placeholder', 'Add Notes...')}
          autoSize={{ minRows: 2 }}
          className={`${styles.textAreaItemStyle}`}
        />
        <div
          className={classNames(
            'flex flex-col',
            styles.metaDataBackground,
            styles.metaDataGap,
            styles.metaDataPadding,
            styles.metaDataRound,
            {
              hidden:
                taskManager.subtasks.length === 0 &&
                !taskManager.startDate &&
                !taskManager.dueDate &&
                taskManager.tags.length === 0 &&
                taskManager.reminders.length === 0,
            }
          )}
        >
          <div
            className={classNames({
              hidden: taskManager.subtasks.length === 0,
            })}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={taskManager.subtasks.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className={classNames(
                    styles.createTaskSubtaskContainerBackground,
                    styles.createTaskSubtaskContainerPadding
                  )}
                >
                  {taskManager.subtasks.map((subtask, index) => (
                    <SubtaskItem
                      disableDragStyle
                      key={subtask.id}
                      id={subtask.id}
                      title={subtask.title}
                      status={subtask.status}
                      onStatusChange={(id, status) => taskManager.updateSubtaskStatus(id, status)}
                      onTitleChange={(id, title) => taskManager.updateSubtaskTitle(id, title)}
                      onCreate={() => taskManager.createSubtask(subtask.id)}
                      onDelete={() => {
                        if (index === 0) {
                          return;
                        }
                        taskManager.deleteSubtask(subtask.id);
                      }}
                      inputRef={(el: HTMLInputElement | null) => {
                        if (el) subtaskInputRefs.current[subtask.id] = el;
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
          <InfoItemGroup items={taskDetailItems} />
        </div>
      </div>
    </div>
  );
};
