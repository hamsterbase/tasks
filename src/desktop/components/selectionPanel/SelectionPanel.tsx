import { getProjectHeadingInfo } from '@/core/state/getProjectHeadingInfo.ts';
import { getTaskInfo } from '@/core/state/getTaskInfo.ts';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { IListService } from '@/services/list/common/listService.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import React from 'react';
import { matchPath, useLocation } from 'react-router';
import { AreaDetailPanel } from './area/AreaDetailPanel.tsx';
import { EmptyPanel } from './EmptyPanel.tsx';
import { HeadingDetailView } from './HeadingDetailView.tsx';
import { MultipleSelectionView } from './MultipleSelectionView.tsx';
import { ProjectDetailPanel } from './project/ProjectDetailPanel.tsx';
import { TaskDetailView } from './TaskDetailView.tsx';

export const SelectionPanel: React.FC = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const listService = useService(IListService);
  useWatchEvent(listService.onMainListChange);
  useWatchEvent(listService.mainList?.onListStateChange);

  const location = useLocation();

  const handleClearSelection = () => {
    listService.mainList?.clearSelection();
  };

  const selectedItems = listService.mainList?.selectedIds || [];

  if (selectedItems.length === 0) {
    // Check if we're on area or project routes using proper route matching
    const areaMatch = matchPath({ path: '/desktop/area/:areaUid' }, location.pathname);

    const projectMatch = matchPath({ path: '/desktop/project/:projectUid' }, location.pathname);

    if (areaMatch) {
      return <AreaDetailPanel />;
    }

    if (projectMatch) {
      return <ProjectDetailPanel />;
    }

    return <EmptyPanel />;
  }

  if (selectedItems.length > 1) {
    return <MultipleSelectionView selectedCount={selectedItems.length} onClearSelection={handleClearSelection} />;
  }

  const selectedItemId = selectedItems[0];
  const taskObject = todoService.modelState.taskObjectMap.get(selectedItemId);

  if (!taskObject) {
    return <EmptyPanel />;
  }

  if (taskObject.type === 'task') {
    const taskInfo = getTaskInfo(todoService.modelState, selectedItemId);
    return <TaskDetailView task={taskInfo} onClearSelection={handleClearSelection} />;
  }

  if (taskObject.type === 'projectHeading') {
    const headingInfo = getProjectHeadingInfo(todoService.modelState, selectedItemId);
    return <HeadingDetailView heading={headingInfo} onClearSelection={handleClearSelection} />;
  }

  return <EmptyPanel />;
};
