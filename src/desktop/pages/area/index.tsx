import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { areaPageTitleInputId } from '@/components/edit/inputId';
import { areaTitleInputKey } from '@/components/edit/inputKeys';
import { AreaIcon, FilterIcon } from '@/components/icons';
import { getAreaDetail } from '@/core/state/getArea';
import { isTaskVisible } from '@/core/time/filterProjectAndTask';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopPage } from '@/desktop/components/DesktopPage';
import { DesktopProjectList } from '@/desktop/components/DesktopProjectList/DesktopProjectList';
import { TagFilterBar } from '@/desktop/components/filter/TagFilterBar';
import { useTagFilter } from '@/desktop/components/filter/useTagFilter';
import { InboxTaskInput } from '@/desktop/components/inboxTaskInput/InboxTaskInput';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings';
import { useScrollToTask } from '@/desktop/hooks/useScrollToTask';
import { useTaskCommands } from '@/desktop/hooks/useTaskCommands';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { localize } from '@/nls';
import { IEditService } from '@/services/edit/common/editService';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import { TestIds } from '@/testIds';
import type { TreeID } from 'loro-crdt';
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { TaskListSection } from './components/TaskListSection';
import { useAreaDetail } from '@/hooks/useAreaDetail';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

const useAreaId = (): TreeID => {
  const todoService = useService(ITodoService);
  const { areaUid } = useParams<{ areaUid?: string }>();
  if (!areaUid) {
    return '0@0';
  }
  const areaId = todoService.modelState.taskObjectUidMap.get(areaUid)?.id;
  if (!areaId) {
    return '0@0';
  }
  return areaId;
};

interface AreaPageContentProps {
  area: ReturnType<typeof getAreaDetail>;
  areaId: TreeID;
}

const AreaPageContent: React.FC<AreaPageContentProps> = ({ area, areaId }) => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  const { areaDetail } = useAreaDetail(areaId);
  const editService = useService(IEditService);
  const location = useLocation();

  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings(`area-${areaId}`);
  useScrollToTask();
  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);

  const state = location.state as { focusInput?: string; highlightTaskId?: string };
  const highlightTaskId = state?.highlightTaskId;

  useEffect(() => {
    if (state?.focusInput && !area.title) {
      editService.focusInput(state.focusInput);
    }
  }, [state?.focusInput, editService, area.title]);

  useWatchEvent(todoService.onStateChange);
  useWatchEvent(listService.onMainListChange);

  useTaskCommands({
    createTask: {
      position: {
        type: 'firstElement',
        parentId: area.id,
      },
    },
    createProject: {
      position: { type: 'firstElement', parentId: area.id },
    },
    setStartDateToToday: true,
  });

  const { showCompletedTasks, showFutureTasks, completedAfter } = useTaskDisplaySettings(`area-${areaId}`);

  const recentChangedTaskSet = new Set<TreeID>(todoService.keepAliveElements as TreeID[]);
  if (highlightTaskId) {
    recentChangedTaskSet.add(highlightTaskId as TreeID);
  }
  const willDisappearObjectIdSet = new Set<string>();

  const allTagsSet = new Set<string>();
  areaDetail?.taskList.forEach((task) => task.tags?.forEach((tag) => allTagsSet.add(tag)));
  areaDetail?.projectList.forEach((project) => project.tags?.forEach((tag) => allTagsSet.add(tag)));
  const latestAllTags = Array.from(allTagsSet).sort();

  useEffect(() => {
    setAllTags((previousTags) => (isSameTags(previousTags, latestAllTags) ? previousTags : latestAllTags));
  }, [latestAllTags]);

  if (!areaDetail) {
    return null;
  }

  const currentTagFilter = tagFilter.currentTag;
  const isTagFilterActive = currentTagFilter.type !== 'all';
  const isEntityMatchedByTags = (entity: { tags?: string[] }): boolean => {
    if (currentTagFilter.type === 'all') {
      return true;
    }
    if (currentTagFilter.type === 'untagged') {
      return !entity.tags || entity.tags.length === 0;
    }
    return !!entity.tags?.includes(currentTagFilter.value);
  };

  const tasks = areaDetail.taskList.filter((task) => {
    const res = isTaskVisible(task, {
      showCompletedTasks,
      showFutureTasks,
      completedAfter,
      currentDate: getTodayTimestampInUtc(),
      recentChangedTaskSet,
    });
    if (res === 'invalid') {
      return false;
    }
    if (!isEntityMatchedByTags(task) && res !== 'recentChanged') {
      return false;
    }
    if (res === 'recentChanged') {
      willDisappearObjectIdSet.add(task.id);
    }
    return true;
  });

  const projects = areaDetail.projectList.filter((project) => {
    const res = isTaskVisible(project, {
      showCompletedTasks,
      showFutureTasks,
      completedAfter,
      currentDate: getTodayTimestampInUtc(),
      recentChangedTaskSet,
    });
    if (res === 'invalid') {
      return false;
    }
    if (!isEntityMatchedByTags(project) && res !== 'recentChanged') {
      return false;
    }
    return true;
  });

  return (
    <DesktopPage
      header={
        <EntityHeader
          editable
          inputKey={areaTitleInputKey(areaId)}
          inputId={areaPageTitleInputId(areaId)}
          renderIcon={() => <AreaIcon />}
          title={area.title}
          placeholder={localize('area.untitled', 'New Area')}
          extraActions={[
            {
              icon: <FilterIcon strokeWidth={1.5} />,
              handleClick: tagFilter.clickFilter,
              title: localize('tasks.filterByTag', 'Filter by Tag'),
              testId: TestIds.EntityHeader.FilterToggleButton,
              isActive: tagFilter.isFilterOpen || isTagFilterActive,
            },
          ]}
          internalActions={{ displaySettings: { onOpen: openTaskDisplaySettings } }}
          titleDetail={
            tagFilter.isFilterOpen ? (
              <TagFilterBar tags={tagFilter.tags} selected={tagFilter.currentTag} onSelect={tagFilter.selectTag} />
            ) : null
          }
          onSave={(title) => {
            todoService.updateArea(areaId, { title });
          }}
        />
      }
    >
      {(projects.length > 0 || !isTagFilterActive) && (
        <>
          <div className={desktopStyles.TodaySectionHeading}>
            <h2 className={desktopStyles.TodaySectionTitle}>{localize('area.projects', 'Projects')}</h2>
          </div>
          <div>
            <DesktopProjectList
              projects={projects}
              hideProjectTitle
              emptyStateLabel={localize('area.noProjects', 'No projects')}
            />
          </div>
        </>
      )}
      <div className={desktopStyles.TodaySectionHeading}>
        <h2 className={desktopStyles.TodaySectionTitle}>{localize('area.tasks', 'Tasks')}</h2>
      </div>
      <div>
        <InboxTaskInput />
        <TaskListSection tasks={tasks} willDisappearObjectIdSet={willDisappearObjectIdSet} areaId={area.id} />
      </div>
    </DesktopPage>
  );
};

export const AreaPage = () => {
  const todoService = useService(ITodoService);
  const areaId = useAreaId();

  let area = null;
  try {
    if (areaId && areaId !== '0@0') {
      area = getAreaDetail(todoService.modelState, areaId);
    }
  } catch {
    // do nothing
  }

  if (!area) {
    return (
      <div className={desktopStyles.EntityPageNotFoundContainer}>
        <div className={desktopStyles.EntityPageNotFoundText}>{localize('area.notFound', 'Area not found')}</div>
      </div>
    );
  }

  return <AreaPageContent area={area} areaId={areaId} />;
};
