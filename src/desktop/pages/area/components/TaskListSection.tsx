import { useDesktopDndSensors } from '@/base/hooks/useDesktopDndSensors';
import { TaskList } from '@/components/taskList/taskList';
import { calculateDragPosition } from '@/core/dnd/calculateDragPosition';
import { TaskInfo } from '@/core/state/type';
import { EmptyState } from '@/desktop/components/EmptyState';
import { DragOverlayItem } from '@/desktop/components/drag/DragOverlayItem';
import { TaskListItem } from '@/desktop/components/taskListItem/TaskListItem';
import { useService } from '@/hooks/use-service';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TreeID } from 'loro-crdt';
import React, { useEffect } from 'react';

interface TaskListSectionProps {
  tasks: TaskInfo[];
  willDisappearObjectIdSet: Set<string>;
  areaId: TreeID;
}

export const TaskListSection: React.FC<TaskListSectionProps> = ({ tasks, willDisappearObjectIdSet, areaId }) => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  const sensors = useDesktopDndSensors();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const position = calculateDragPosition(
      active.id as string,
      over.id as string,
      tasks.map((p) => p.id)
    );
    if (position) {
      todoService.updateTask(active.id as TreeID, {
        position,
      });
    }
  };

  useEffect(() => {
    const allTaskIds = tasks.map((task) => task.id);
    if (listService.mainList && listService.mainList.name === `Area-${areaId}`) {
      listService.mainList.updateItems(allTaskIds);
    } else {
      listService.setMainList(new TaskList(`Area-${areaId}`, allTaskIds, [], null, null));
    }
  }, [listService, areaId, tasks]);

  const taskList = listService.mainList;

  if (tasks.length === 0 || !taskList) {
    return <EmptyState label="No tasks yet" />;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {tasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              taskList={taskList}
              willDisappear={willDisappearObjectIdSet.has(task.id)}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlayItem />
    </DndContext>
  );
};
