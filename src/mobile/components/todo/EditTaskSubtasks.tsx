import { TaskInfo } from '@/core/state/type';
import { useEditTaskHooks } from '@/hooks/useEditTask.tsx';
import { SubtaskItem } from '@/mobile/components/todo/SubtaskItem';
import { styles } from '@/mobile/theme';
import { closestCenter, DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React from 'react';
import { OverlayItem } from '../dnd/DragOverlayItem';

interface EditTaskSubtasksProps {
  taskInfo: TaskInfo;
  taskActions: ReturnType<typeof useEditTaskHooks>;
}

export const EditTaskSubtasks: React.FC<EditTaskSubtasksProps> = ({ taskInfo, taskActions }) => {
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

  const finishedCount = taskInfo.children.filter((c) => c.status === 'completed' || c.status === 'canceled').length;

  return (
    <>
      <div className={styles.editingTaskSubtaskHeader}>
        <span>{`${finishedCount} / ${taskInfo.children.length}`}</span>
        <div className={styles.editingTaskSubtaskProgressBar}>
          <div
            className={styles.editingTaskSubtaskProgressFill}
            style={{
              width: `${(finishedCount / taskInfo.children.length) * 100}%`,
            }}
          />
        </div>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={taskActions.handleDragEnd}>
        <SortableContext items={taskInfo.children.map((item) => item.id)} strategy={verticalListSortingStrategy}>
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
  );
};
