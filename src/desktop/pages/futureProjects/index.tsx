import { getTodayTimestampInUtc } from '@/base/common/time';
import { LaterProjectsIcon } from '@/components/icons';
import { getFutureProjects } from '@/core/state/home/getFutureProjects';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopProjectList } from '@/desktop/components/DesktopProjectList/DesktopProjectList';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import React from 'react';

export const FutureProjects = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const futureProjects = getFutureProjects(todoService.modelState, getTodayTimestampInUtc());

  return (
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <EntityHeader
          renderIcon={() => <LaterProjectsIcon className="size-5 text-t2" />}
          title={localize('futureProjects', 'Future Projects')}
        />
        <div className="flex-1 overflow-y-auto p-4">
          <DesktopProjectList
            projects={futureProjects}
            emptyStateLabel={localize('futureProjects.empty', 'No future projects')}
          />
        </div>
      </div>
    </div>
  );
};
