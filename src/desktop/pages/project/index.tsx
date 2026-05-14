import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { TaskList } from '@/components/taskList/taskList.ts';
import { getProjectHeadingAndTasks } from '@/core/state/getProjectHeadingAndTasks';
import { getProject } from '@/core/state/getProject';
import { DesktopPage } from '@/desktop/components/DesktopPage';
import { useScrollToTask } from '@/desktop/hooks/useScrollToTask';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { useTagFilter } from '@/desktop/components/filter/useTagFilter';
import { localize } from '@/nls';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectTaskArea } from './components/ProjectTaskArea';
import { useProjectDragAndDrop } from './hooks/useProjectDragAndDrop';
import { useProjectEvents } from './hooks/useProjectEvents';
import { useProjectId } from './hooks/useProjectId';

interface ProjectContentProps {
  project: ReturnType<typeof getProject>;
  projectId: string;
}

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

const ProjectContent: React.FC<ProjectContentProps> = ({ project, projectId }) => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  const location = useLocation();

  useWatchEvent(todoService.onStateChange);
  useWatchEvent(listService.onMainListChange);
  useScrollToTask();

  const { showCompletedTasks, showFutureTasks, completedAfter } = useTaskDisplaySettings(`project-${projectId}`);
  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);

  const state = location.state as { highlightTaskId?: string };
  const highlightTaskId = state?.highlightTaskId;

  const recentChangedTaskSet = new Set<TreeID>(todoService.keepAliveElements as TreeID[]);
  if (highlightTaskId) {
    recentChangedTaskSet.add(highlightTaskId as TreeID);
  }

  const {
    flattenedItemsResult,
    willDisappearObjectIdSet,
    allTags: latestAllTags,
  } = getProjectHeadingAndTasks({
    modelData: todoService.modelState,
    projectId: project.id,
    option: {
      showCompletedTasks,
      showFutureTasks,
      completedAfter,
      currentDate: getTodayTimestampInUtc(),
      recentChangedTaskSet,
    },
    tags: tagFilter.currentTag,
    disableCreateTask: true,
  });

  useEffect(() => {
    setAllTags((previousTags) => (isSameTags(previousTags, latestAllTags) ? previousTags : latestAllTags));
  }, [latestAllTags]);

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
    <DesktopPage
      header={
        <ProjectHeader
          project={project}
          projectId={projectId}
          isFilterOpen={tagFilter.isFilterOpen}
          onToggleFilter={tagFilter.clickFilter}
          availableTags={tagFilter.tags}
          tagFilter={tagFilter.currentTag}
          onSelectTagFilter={tagFilter.selectTag}
        />
      }
    >
      <ProjectTaskArea
        project={project}
        flattenedItems={flattenedItems}
        flattenedItemsResult={flattenedItemsResult}
        willDisappearObjectIdSet={willDisappearObjectIdSet}
        taskList={mainList}
        onDragEnd={handleDragEnd}
      />
    </DesktopPage>
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
      <div className={desktopStyles.EntityPageNotFoundContainer}>
        <div className={desktopStyles.EntityPageNotFoundText}>{localize('project.notFound', 'Project not found')}</div>
      </div>
    );
  }

  return <ProjectContent key={projectId} project={project} projectId={projectId} />;
};
