import { getTodayTimestampInUtc } from '@/base/common/time';
import { TaskList } from '@/components/taskList/taskList.ts';
import { flattenProjectTaskNew } from '@/core/state/flattenProjectHeading-New';
import { getProject } from '@/core/state/getProject';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { localize } from '@/nls';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import React, { useEffect } from 'react';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectTaskArea } from './components/ProjectTaskArea';
import { useProjectDragAndDrop } from './hooks/useProjectDragAndDrop';
import { useProjectEvents } from './hooks/useProjectEvents';
import { useProjectId } from './hooks/useProjectId';

interface ProjectContentProps {
  project: ReturnType<typeof getProject>;
  projectId: string;
}

const ProjectContent: React.FC<ProjectContentProps> = ({ project, projectId }) => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);

  useWatchEvent(todoService.onStateChange);
  useWatchEvent(listService.onMainListChange);

  const { showCompletedTasks, showFutureTasks, completedAfter } = useTaskDisplaySettings(`project-${projectId}`);

  const { flattenedItemsResult, willDisappearObjectIdSet } = flattenProjectTaskNew({
    modelData: todoService.modelState,
    projectId: project.id,
    option: {
      showCompletedTasks,
      showFutureTasks,
      completedAfter,
      currentDate: getTodayTimestampInUtc(),
      recentChangedTaskSet: new Set<TreeID>(todoService.keepAliveElements as TreeID[]),
    },
    disableCreateTask: true,
  });

  const { flattenedItems } = flattenedItemsResult;

  const projectTasks = flattenedItems
    .filter((item) => item.type === 'item' || item.type === 'header')
    .map((item) => item.id);

  useEffect(() => {
    if (listService.mainList && listService.mainList.name === `Project-${project.id}`) {
      listService.mainList.updateItems(projectTasks);
    } else {
      listService.setMainList(new TaskList(`Project-${project.id}`, projectTasks, [], null, null));
    }
  }, [listService, project.id, projectTasks]);

  const { handleDragEnd } = useProjectDragAndDrop({ flattenedItemsResult });
  useProjectEvents();

  const mainList = listService.mainList;
  if (!mainList) {
    return null;
  }

  return (
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <ProjectHeader project={project} projectId={projectId} />
        <ProjectTaskArea
          project={project}
          flattenedItems={flattenedItems}
          flattenedItemsResult={flattenedItemsResult}
          willDisappearObjectIdSet={willDisappearObjectIdSet}
          taskList={mainList}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
};

export const ProjectPage = () => {
  const todoService = useService(ITodoService);

  const projectId = useProjectId();
  let project = null;
  try {
    if (projectId) {
      project = getProject(todoService.modelState, projectId);
    }
  } catch {
    // do nothing
  }

  if (!project) {
    return (
      <div className="h-full w-full bg-bg1 flex items-center justify-center">
        <div className="text-t3 text-lg">{localize('project.notFound', 'Project not found')}</div>
      </div>
    );
  }

  return <ProjectContent project={project} projectId={projectId} />;
};
