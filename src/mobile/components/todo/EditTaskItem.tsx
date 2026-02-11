import { MenuIcon } from '@/components/icons';
import { TaskInfo } from '@/core/state/type';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useCancelEdit } from '@/hooks/useCancelEdit';
import { useEdit } from '@/hooks/useEdit';
import { useEditTaskHooks } from '@/hooks/useEditTask.tsx';
import { useLongPress } from '@/hooks/useLongPress';
import { SubtaskItem } from '@/mobile/components/todo/SubtaskItem';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { closestCenter, DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import TextArea from 'rc-textarea';
import React, { useRef } from 'react';
import { OverlayItem } from '../dnd/DragOverlayItem';
import { InfoItemGroup } from '../InfoItem';
import { TaskStatusBox } from '../taskItem/TaskStatusBox';
interface EditTaskItemProps {
  taskInfo: TaskInfo;
}

export const EditTaskItem: React.FC<EditTaskItemProps> = ({ taskInfo }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
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

  const { longPressEvents } = useLongPress(() => {
    popupAction({
      groups: [
        {
          items: [
            {
              condition: taskInfo.status !== 'created',
              icon: <TaskStatusBox status={'created'} />,
              name: localize('tasks.mark_as_created', 'Mark as Created'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'created' });
              },
            },
            {
              condition: taskInfo.status !== 'completed',
              icon: <TaskStatusBox status={'completed'} />,
              name: localize('tasks.mark_as_completed', 'Mark as Completed'),
              onClick: () => {
                todoService.updateTask(taskInfo.id, { status: 'completed' });
              },
            },
            {
              condition: taskInfo.status !== 'canceled',
              icon: <TaskStatusBox status={'canceled'} />,
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

  return (
    <div
      ref={divRef}
      onClick={shouldIgnoreClick}
      className={classNames(
        'flex flex-col gap-y-2',
        styles.taskItemPaddingX,
        styles.listItemEditingBackground,
        styles.taskItemEditingShadow,
        styles.taskItemEditingRound,
        itemClassName,
        'py-2'
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 flex pt-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              taskActions.toggleTask();
            }}
            {...longPressEvents}
            className="flex-shrink-0 size-5 flex items-center justify-center text-t3"
          >
            <TaskStatusBox className={classNames('size-5 rounded-sm')} status={taskInfo.status} />
          </button>
        </div>
        <div className="flex-1 min-w-0 flex items-center">
          <TextArea
            {...textAreaProps}
            ref={(el) => {
              if (el) {
                textAreaProps.ref.current = el.nativeElement as HTMLInputElement;
              }
            }}
            autoSize={{ minRows: 1 }}
            className="text-lg flex-1 overflow-hidden text-ellipsis bg-transparent  text-t1 outline-none w-full"
          />
        </div>
      </div>
      <div className="pl-7">
        <TextArea
          {...notesProps}
          ref={(el) => {
            if (el) {
              notesProps.ref.current = el.nativeElement as HTMLInputElement;
            }
          }}
          className={`${styles.itemEditTaskNotesTextAreaStyle}`}
          autoSize={{ minRows: 1, maxRows: 5 }}
          placeholder={localize('edit_task_item.task_notes_placeholder', 'Add Notes...')}
        />
      </div>

      <div className={classNames('pl-6.5')}>
        {
          <div
            className={classNames(
              styles.editingTaskSubtaskContainerSpacing,
              styles.editingTaskSubtaskContainerMargin,
              styles.editingTaskSubtaskContainerRound,
              'flex flex-col',
              styles.editingTaskSubtaskContainerBackground,
              {
                hidden: taskInfo.children.length === 0,
              }
            )}
          >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={taskActions.handleDragEnd}>
              <SortableContext items={taskInfo.children.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <OverlayItem
                  isSubtask={true}
                  className={`${styles.editingTaskSubtaskPadding} ${styles.editingTaskSubtaskContainerBackground}`}
                />
                {taskInfo.children.map((child) => (
                  <SubtaskItem
                    key={child.id}
                    className={`${styles.editingTaskSubtaskPadding} ${styles.editingTaskSubtaskContainerBackground}`}
                    id={child.id}
                    title={child.title}
                    status={child.status}
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
          </div>
        }
        <InfoItemGroup items={taskActions.taskDetailItems} />
        <div className={classNames('flex justify-end items-center pt-2')}>
          <div className="flex justify-end">
            {taskActions.bottomActions.map((action) => (
              <button className={styles.taskDetailBottomActionStyle} key={action.key} onClick={action.onClick}>
                {action.icon}
              </button>
            ))}
            <button className={styles.taskDetailBottomActionStyle} onClick={(e) => taskActions.handleMoreOptions(e)}>
              <MenuIcon className={styles.taskDetailBottomActionIconStyle} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
