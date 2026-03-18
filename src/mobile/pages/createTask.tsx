import { formatDate } from '@/core/time/formatDate';
import { formatRemainingDays } from '@/core/time/formatRemainingDays';
import { formatReminderTime } from '@/core/time/formatReminderTime';
import { isPastOrToday } from '@/core/time/isPast';
import { mergeDateAndTime } from '@/core/time/mergeDateAndTime';
import { BellIcon, CalendarIcon, CheckIcon, FlagIcon, ListChecksIcon, NotesIcon, TagIcon } from '@/components/icons';
import { useCreateTask } from '@/hooks/useCreateTask';
import { useDragSensors } from '@/hooks/useDragSensors';
import { localize } from '@/nls';
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useLayoutEffect, useRef } from 'react';
import { PageHeader } from '../components/PageHeader';
import { SubtaskItem } from '../components/todo/SubtaskItem';
import { AttrList, AttrRowItem } from '../components/attr/AttrList';
import { useMobileDatepicker } from '../overlay/datePicker/useDatepicker';
import { useTagEditor } from '../overlay/tagEditor/useTagEditor';
import { useTimePicker } from '../overlay/timePicker/useTimePicker';
import { MobileTestIds } from '../testids';
import { styles } from '../theme';
import { restrictToVerticalAxis } from '@/utils/dnd/restrictToVerticalAxis';

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

  function onConfirm() {
    console.log('Confirm task creation - functionality not implemented yet.');
    console.log('Task Details:', {
      title: taskManager.title,
      notes: taskManager.notes,
      startDate: taskManager.startDate,
      dueDate: taskManager.dueDate,
      tags: taskManager.tags,
      subtasks: taskManager.subtasks,
      reminders: taskManager.reminders,
    });
  }

  const attrRows: AttrRowItem[] = [
    {
      type: 'textArea',
      key: 'notes',
      icon: <NotesIcon className={styles.createTaskAttrIcon} />,
      content: taskManager.notes,
      onChange: (v) => taskManager.updateNotes(v),
      placeholder: localize('create_sask_action_sheet.task_notes_placeholder', 'Add Notes...'),
    },
    {
      type: 'label',
      key: 'startDate',
      icon: <CalendarIcon className={styles.createTaskAttrIcon} />,
      placeholder: localize('create_task_page.add_start_date', 'Set Start Date'),
      value: taskManager.startDate ? { title: formatDate(taskManager.startDate) } : undefined,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: taskManager.startDate,
          onDateSelected: (date) => taskManager.updateStartDate(date),
        });
      },
      onClear: () => taskManager.clearStartDate(),
    },
    {
      type: 'label',
      key: 'dueDate',
      icon: <FlagIcon className={styles.createTaskAttrIcon} />,
      placeholder: localize('create_task_page.add_due_date', 'Set Due Date'),
      testId: MobileTestIds.CreateTask.DueDateRow,
      value: taskManager.dueDate
        ? {
            title: localize('create_task_page.due_date', 'Due Date') + ': ' + formatDate(taskManager.dueDate),
            subtitle: formatRemainingDays(taskManager.dueDate),
            titleType: isPastOrToday(taskManager.dueDate) ? 'danger' : undefined,
          }
        : undefined,
      onClick: () => {
        mobileDatepicker.showDatePicker({
          initialDate: taskManager.dueDate,
          onDateSelected: (date) => taskManager.updateDueDate(date),
        });
      },
      onClear: () => taskManager.clearDueDate(),
    },
    {
      type: 'tags',
      key: 'tags',
      icon: <TagIcon className={styles.createTaskAttrIcon} />,
      placeholder: localize('create_task_page.add_tags', 'Add Tags'),
      tags: taskManager.tags,
      testId: MobileTestIds.CreateTask.TagsRow,
      onClick: () => {
        tagEditor(taskManager.tags, (tags) => taskManager.updateTags(tags));
      },
    },
    {
      type: 'tasks',
      key: 'subtasks',
      icon: <ListChecksIcon className={styles.createTaskAttrIcon} />,
      children: (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={taskManager.subtasks.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {taskManager.subtasks.map((subtask, index) => (
              <SubtaskItem
                disableDragStyle
                key={subtask.id}
                id={subtask.id}
                title={subtask.title}
                status={subtask.status}
                className={styles.createTaskSubtaskItem}
                statusButtonClassName={styles.createTaskSubtaskItemIcon}
                inputClassName={styles.createTaskSubtaskInput}
                dragHandleClassName={styles.createTaskSubtaskDragHandle}
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
                inputTestId={MobileTestIds.CreateTask.SubtaskInput}
              />
            ))}
          </SortableContext>
        </DndContext>
      ),
      addButtonLabel: localize('create_task_page.add_subtask', '+ Add Subtask'),
      onAdd: () => taskManager.createSubtask(),
      addButtonTestId: MobileTestIds.CreateTask.AddSubtaskButton,
    },
    {
      type: 'interactive',
      key: 'reminders',
      icon: <BellIcon className={styles.createTaskAttrIcon} />,
      placeholder: localize('create_task_page.add_reminder', '+ Add Reminder'),
      testId: MobileTestIds.CreateTask.RemindersRow,
      items: taskManager.reminders.map((r) => {
        const { date, time } = formatReminderTime(r.time);
        return { title: date || time, subtitle: date ? time : undefined };
      }),
      onLabelClick: (index) => {
        const reminder = taskManager.reminders[index];
        if (!reminder) return;
        mobileDatepicker.showDatePicker({
          initialDate: reminder.time,
          onDateSelected: async (date) => {
            const time = await timePicker.showTimePickerPromise(reminder.time);
            const mergedDateTime = mergeDateAndTime(date, time);
            taskManager.updateReminder(reminder.id, mergedDateTime.getTime());
          },
        });
      },
      onRemove: (index) => {
        const reminder = taskManager.reminders[index];
        if (reminder) {
          taskManager.deleteReminder(reminder.id);
        }
      },
      addButtonLabel: localize('create_task_page.add_reminder', '+ Add Reminder'),
      onAdd: () => {
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

  return (
    <div className={styles.createTaskPageStyle}>
      <PageHeader
        title={localize('create_task_page.title', 'New Task')}
        showBack
        actions={[
          {
            icon: <CheckIcon />,
            onClick: onConfirm,
          },
        ]}
      />

      <main className={styles.screenEdgePadding}>
        <div className={styles.createTaskCardRoot}>
          <div className={styles.createTaskAttrRow}>
            <input
              ref={titleRef}
              autoFocus
              value={taskManager.title}
              onChange={(e) => taskManager.updateTitle(e.target.value)}
              placeholder={localize('create_sask_action_sheet.task_title_placeholder', 'Task Title')}
              className={styles.createTaskTitleInput}
              autoComplete="new-password"
              data-testid={MobileTestIds.CreateTask.TitleInput}
            />
          </div>
          <AttrList items={attrRows} />
        </div>
      </main>
    </div>
  );
};
