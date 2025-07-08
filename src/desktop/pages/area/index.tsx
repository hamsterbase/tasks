import { getTodayTimestampInUtc } from '@/base/common/time';
import { getAreaDetail } from '@/core/state/getArea';
import { isTaskVisible } from '@/core/time/filterProjectAndTask';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useArea } from '@/hooks/useArea';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { useParams } from 'react-router';
import { AreaContent } from './components/AreaContent';
import { AreaHeader } from './components/AreaHeader';

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

  useWatchEvent(todoService.onStateChange);
  useWatchEvent(listService.onMainListChange);

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
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <AreaHeader area={area} areaId={areaId} />
        <AreaContent
          area={area}
          areaDetail={areaDetail}
          projects={projects}
          tasks={tasks}
          willDisappearObjectIdSet={willDisappearObjectIdSet}
        />
      </div>
    </div>
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
      <div className="h-full w-full bg-bg1 flex items-center justify-center">
        <div className="text-t3 text-lg">Area not found</div>
      </div>
    );
  }

  return <AreaPageContent area={area} areaId={areaId} />;
};
