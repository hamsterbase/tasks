import { getTaskInfo } from '@/core/state/getTaskInfo.ts';
import { UpdateTaskSchema } from '@/core/type.ts';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { IListService } from '@/services/list/common/listService.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import React from 'react';
import { EmptyPanel } from './EmptyPanel.tsx';
import { MultipleSelectionView } from './MultipleSelectionView.tsx';
import { TaskDetailView } from './TaskDetailView.tsx';

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
