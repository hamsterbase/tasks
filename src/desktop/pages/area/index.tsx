import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { areaPageTitleInputId } from '@/components/edit/inputId';
import { areaTitleInputKey } from '@/components/edit/inputKeys';
import { AreaIcon } from '@/components/icons';
import { getAreaDetail } from '@/core/state/getArea';
import { isTaskVisible } from '@/core/time/filterProjectAndTask';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopPage } from '@/desktop/components/DesktopPage';
import { DesktopProjectList } from '@/desktop/components/DesktopProjectList/DesktopProjectList';
import { InboxTaskInput } from '@/desktop/components/inboxTaskInput/InboxTaskInput';
import { TitleContentSection } from '@/desktop/components/TitleContentSection';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings';
import { useTaskCommands } from '@/desktop/hooks/useTaskCommands';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useArea } from '@/mobile/hooks/useArea';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { localize } from '@/nls';
import { IEditService } from '@/services/edit/common/editService';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import { TaskListSection } from './components/TaskListSection';

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
  const { areaDetail } = useArea(areaId);
  const editService = useService(IEditService);
  const location = useLocation();

  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings(`area-${areaId}`);

  const state = location.state as { focusInput?: string };
  useEffect(() => {
    if (state?.focusInput && !area.title) {
      editService.focusInput(state.focusInput);
    }
  }, [state?.focusInput, editService, area.title]);

  useWatchEvent(todoService.onStateChange);
  useWatchEvent(listService.onMainListChange);

  const handleCreateProject = () => {
    todoService.fireTaskCommand({ type: 'createProject' });
  };

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
  const willDisappearObjectIdSet = new Set<string>();

  if (!areaDetail) {
    return null;
  }

  const tasks = areaDetail.taskList.filter((task) => {
    const res = isTaskVisible(task, {
      showCompletedTasks,
      showFutureTasks,
      completedAfter,
      currentDate: getTodayTimestampInUtc(),
      recentChangedTaskSet,
    });
    if (res === 'recentChanged') {
      willDisappearObjectIdSet.add(task.id);
    }
    return res === 'valid' || res === 'recentChanged';
  });

  const projects = areaDetail.projectList.filter((project) => {
    const res = isTaskVisible(project, {
      showCompletedTasks,
      showFutureTasks,
      completedAfter,
      currentDate: getTodayTimestampInUtc(),
      recentChangedTaskSet,
    });
    return res === 'valid' || res === 'recentChanged';
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
          internalActions={{ displaySettings: { onOpen: openTaskDisplaySettings } }}
          onSave={(title) => {
            todoService.updateArea(areaId, { title });
          }}
        />
      }
    >
      <TitleContentSection
        title={localize('area.projects', 'Projects')}
        action={
          <button onClick={handleCreateProject} className={desktopStyles.TitleContentSectionActionButton}>
            {localize('area.newProject', 'New Project')}
          </button>
        }
      >
        <DesktopProjectList
          projects={projects}
          hideProjectTitle
          emptyStateLabel={localize('area.noProjects', 'No projects in this area')}
        />
      </TitleContentSection>
      <TitleContentSection title={localize('area.tasks', 'Tasks')}>
        <InboxTaskInput />
        <TaskListSection tasks={tasks} willDisappearObjectIdSet={willDisappearObjectIdSet} areaId={area.id} />
      </TitleContentSection>
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
      <div className={desktopStyles.AreaPageNotFoundContainer}>
        <div className={desktopStyles.AreaPageNotFoundText}>{localize('area.notFound', 'Area not found')}</div>
      </div>
    );
  }

  return <AreaPageContent area={area} areaId={areaId} />;
};
