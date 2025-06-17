import { getTaskInfo } from '@/core/state/getTaskInfo';
import { UpdateTaskSchema } from '@/core/type';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import React from 'react';
import { EmptyPanel } from './EmptyPanel';
import { MultipleSelectionView } from './MultipleSelectionView';
import { TaskDetailView } from './TaskDetailView';

export const SelectionPanel: React.FC = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const listService = useService(IListService);
  useWatchEvent(listService.onMainListChange);
  useWatchEvent(listService.mainList?.onListStateChange);

  const selectedItems = listService.mainList?.selectedIds || [];

  if (selectedItems.length === 0) {
    return <EmptyPanel />;
  }

  if (selectedItems.length > 1) {
    return <MultipleSelectionView selectedCount={selectedItems.length} />;
  }

  const selectedItemId = selectedItems[0];
  const taskObject = todoService.modelState.taskObjectMap.get(selectedItemId);

  if (!taskObject) {
    return <EmptyPanel />;
  }

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

  return <EmptyPanel />;
};
