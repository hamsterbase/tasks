import { getTaskInfo } from '@/core/state/getTaskInfo';
import { UpdateTaskSchema } from '@/core/type';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ISelectionService } from '@/services/selection/common/selectionService';
import { ITodoService } from '@/services/todo/common/todoService';
import React from 'react';
import { EmptyPanel } from './EmptyPanel';
import { MultipleSelectionView } from './MultipleSelectionView';
import { TaskDetailView } from './TaskDetailView';

export const SelectionPanel: React.FC = () => {
  const selectionService = useService(ISelectionService);
  const todoService = useService(ITodoService);

  useWatchEvent(selectionService.onSelectionChanged);
  useWatchEvent(todoService.onStateChange);

  const selectedItems = selectionService.selectedItems;

  // If no selection, don't render anything
  if (selectedItems.length === 0) {
    return <EmptyPanel />;
  }

  // If multiple items selected
  if (selectedItems.length > 1) {
    return <MultipleSelectionView selectedCount={selectedItems.length} />;
  }

  // Single item selected
  const selectedItemId = selectedItems[0];
  const taskObject = todoService.modelState.taskObjectMap.get(selectedItemId);

  if (!taskObject) {
    return <EmptyPanel />;
  }

  // Only show task details for now
  if (taskObject.type === 'task') {
    const taskInfo = getTaskInfo(todoService.modelState, selectedItemId);
    return (
      <TaskDetailView
        task={taskInfo}
        onUpdate={(updates: UpdateTaskSchema) => {
          todoService.updateTask(selectedItemId, updates);
        }}
      />
    );
  }

  // For other types (project, area, etc), return null for now
  return <EmptyPanel />;
};
