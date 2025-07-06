import { useService } from '@/hooks/use-service';
import { ITodoService } from '@/services/todo/common/todoService';
import { getFlattenedItemsDragEndPosition } from '@/utils/dnd/flattenedItemsDragPosition.ts';
import { DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { FlattenedResult } from '@/core/state/home/flattenedItemsToResult.ts';
import { ProjectHeadingInfo, TaskInfo } from '@/core/state/type';

interface UseProjectDragAndDropProps {
  flattenedItemsResult: FlattenedResult<ProjectHeadingInfo, TaskInfo>;
}

export const useProjectDragAndDrop = ({ flattenedItemsResult }: UseProjectDragAndDropProps) => {
  const todoService = useService(ITodoService);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });
  
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = (event: DragEndEvent): null | undefined => {
    const { active, over } = event;
    if (!over) return null;

    const overId = over.id as string;
    const activeId = active.id as string;
    const result = getFlattenedItemsDragEndPosition(activeId, overId, flattenedItemsResult);

    if (result) {
      if (result.type === 'createItem') {
        const taskId = todoService.addTask({
          title: '',
          position: result.position,
        });
        setTimeout(() => {
          todoService.editItem(taskId);
        }, 60);
      }

      if (result.type === 'moveItem') {
        todoService.updateTask(result.activeId, {
          position: result.position,
        });
      }

      if (result.type === 'moveHeader') {
        todoService.updateProjectHeading(result.activeId, {
          position: result.position,
        });
      }
    }
  };

  return {
    sensors,
    handleDragEnd,
  };
};
