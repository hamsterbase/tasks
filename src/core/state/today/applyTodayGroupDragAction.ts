import type { TreeID } from 'loro-crdt';
import { ItemMovePosition, ItemPosition } from '@/core/type';
import { TodayGroupDragAction } from './getTodayGroupDragAction';

/**
 * Minimal structural slice of ITodoService needed to apply a grouped Today
 * drag action. Declared locally so this module stays UI/service agnostic.
 */
export interface TodayGroupDragTodoService {
  moveDateAssignedList(item: TreeID, position: ItemMovePosition): void;
  updateTask(taskId: TreeID, payload: { parentId?: TreeID; position?: ItemPosition }): void;
  updateProject(projectId: TreeID, payload: { position?: ItemPosition }): void;
}

/**
 * Apply the resolved grouped Today drag action:
 * - reorder: just move the item within the date-assigned list
 * - moveTask: reassign the task's project (or clear it), then place it next to
 *   the drop target in the date-assigned list
 * - moveProject: reassign the project's area (or clear it), then place it next
 *   to the drop target in the date-assigned list
 */
export function applyTodayGroupDragAction(
  todoService: TodayGroupDragTodoService,
  activeId: TreeID,
  action: TodayGroupDragAction
): void {
  switch (action.kind) {
    case 'reorder': {
      todoService.moveDateAssignedList(activeId, action.position);
      return;
    }
    case 'moveTask': {
      if (action.parentId === null) {
        todoService.updateTask(activeId, { position: { type: 'firstElement', parentId: undefined } });
      } else {
        todoService.updateTask(activeId, { parentId: action.parentId });
      }
      todoService.moveDateAssignedList(activeId, action.position);
      return;
    }
    case 'moveProject': {
      todoService.updateProject(activeId, {
        position: { type: 'firstElement', parentId: action.areaId ?? undefined },
      });
      todoService.moveDateAssignedList(activeId, action.position);
      return;
    }
  }
}
