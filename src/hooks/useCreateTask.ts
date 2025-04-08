import { useState, useCallback, useRef } from 'react';
import { generateUuid } from 'vscf/base/common/uuid';
import { CreateTaskSchema, ItemStatus } from '@/core/type.ts';
import { useService } from './use-service';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';

interface CreateTaskCheckList {
  id: string;
  title: string;
  status: ItemStatus;
}

export interface CreateTaskPayload extends Partial<CreateTaskSchema> {
  onCreate?: (taskId: TreeID) => void;
}

export function useCreateTask(initialPayload: CreateTaskPayload = {}) {
  const todoService = useService(ITodoService);

  // State
  const [title, setTitle] = useState(initialPayload.title || '');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>(initialPayload.tags || []);
  const [startDate, setStartDate] = useState<number | undefined>(
    initialPayload.startDate === null ? undefined : initialPayload.startDate
  );
  const [dueDate, setDueDate] = useState<number | undefined>(
    initialPayload.dueDate === null ? undefined : initialPayload.dueDate
  );
  const [subtasks, setSubtasks] = useState<CreateTaskCheckList[]>([]);

  // Refs
  const focusSubtaskCallbackRef = useRef<((id: string) => void) | null>(null);

  // Handlers
  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const updateNotes = useCallback((newNotes: string) => {
    setNotes(newNotes);
  }, []);

  const updateTags = useCallback((newTags: string[]) => {
    setTags(newTags);
  }, []);

  const updateStartDate = useCallback((newStartDate: number | undefined) => {
    setStartDate(newStartDate);
  }, []);

  const updateDueDate = useCallback((newDueDate: number | undefined) => {
    setDueDate(newDueDate);
  }, []);

  const clearStartDate = useCallback(() => {
    setStartDate(undefined);
  }, []);

  const clearDueDate = useCallback(() => {
    setDueDate(undefined);
  }, []);

  const createSubtask = useCallback((previousId?: string) => {
    const newSubtask = { title: '', status: 'created' as ItemStatus, id: generateUuid() };

    setSubtasks((prevSubtasks) => {
      if (previousId) {
        const previousIndex = prevSubtasks.findIndex((subtask) => subtask.id === previousId);
        if (previousIndex >= 0) {
          const newSubtasks = [...prevSubtasks];
          newSubtasks.splice(previousIndex + 1, 0, newSubtask);
          return newSubtasks;
        }
      }
      return [...prevSubtasks, newSubtask];
    });

    // Focus the new subtask input after a short delay
    setTimeout(() => {
      if (focusSubtaskCallbackRef.current) {
        focusSubtaskCallbackRef.current(newSubtask.id);
      }
    }, 20);
  }, []);

  const updateSubtaskTitle = useCallback((id: string, title: string) => {
    setSubtasks((prevSubtasks) => {
      const index = prevSubtasks.findIndex((subtask) => subtask.id === id);
      if (index >= 0) {
        const newSubtasks = [...prevSubtasks];
        newSubtasks[index] = { ...newSubtasks[index], title };
        return newSubtasks;
      }
      return prevSubtasks;
    });
  }, []);

  const updateSubtaskStatus = useCallback((id: string, status: ItemStatus) => {
    setSubtasks((prevSubtasks) => {
      const index = prevSubtasks.findIndex((subtask) => subtask.id === id);
      if (index >= 0) {
        const newSubtasks = [...prevSubtasks];
        newSubtasks[index] = { ...newSubtasks[index], status };
        return newSubtasks;
      }
      return prevSubtasks;
    });
  }, []);

  const deleteSubtask = useCallback((id: string) => {
    setSubtasks((prevSubtasks) => {
      const index = prevSubtasks.findIndex((subtask) => subtask.id === id);
      if (index > 0) {
        const previous = prevSubtasks[index - 1];
        if (focusSubtaskCallbackRef.current) {
          focusSubtaskCallbackRef.current(previous.id);
        }

        setTimeout(() => {
          setSubtasks((currentSubtasks) => {
            const updatedIndex = currentSubtasks.findIndex((subtask) => subtask.id === id);
            if (updatedIndex >= 0) {
              const newSubtasks = [...currentSubtasks];
              newSubtasks.splice(updatedIndex, 1);
              return newSubtasks;
            }
            return currentSubtasks;
          });
        }, 10);
      } else if (index === 0) {
        // If it's the first subtask, just remove it
        const newSubtasks = [...prevSubtasks];
        newSubtasks.splice(index, 1);
        return newSubtasks;
      }
      return prevSubtasks;
    });
  }, []);

  const updateSubtaskOrder = useCallback((newSubtasks: CreateTaskCheckList[]) => {
    setSubtasks(newSubtasks);
  }, []);

  const confirmTask = useCallback(() => {
    const newTaskId = todoService.addTask({
      title,
      notes,
      position: initialPayload.position,
      tags,
      startDate,
      dueDate,
    });

    subtasks.reverse().forEach((subtask) => {
      todoService.addTask({
        title: subtask.title,
        position: { type: 'firstElement', parentId: newTaskId },
      });
    });
    return newTaskId;
  }, [title, notes, initialPayload.position, tags, startDate, dueDate, subtasks, todoService]);

  const setFocusSubtaskCallback = useCallback((callback: (id: string) => void) => {
    focusSubtaskCallbackRef.current = callback;
  }, []);

  return {
    // State
    title,
    notes,
    tags,
    startDate,
    dueDate,
    subtasks,

    // Update methods
    updateTitle,
    updateNotes,
    updateTags,
    updateStartDate,
    updateDueDate,
    clearStartDate,
    clearDueDate,

    // Subtask methods
    createSubtask,
    updateSubtaskTitle,
    updateSubtaskStatus,
    deleteSubtask,
    updateSubtaskOrder,

    // Task creation
    confirmTask,

    // Focus handling
    setFocusSubtaskCallback,
  };
}
