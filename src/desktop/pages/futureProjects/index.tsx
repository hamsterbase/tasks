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
import { desktopStyles } from '@/desktop/theme/main';

export const FutureProjects = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const futureProjects = getFutureProjects(todoService.modelState, getTodayTimestampInUtc());

  return (
    <div className={desktopStyles.FutureProjectsPageContainer}>
      <div className={desktopStyles.FutureProjectsPageWrapper}>
        <EntityHeader renderIcon={() => <LaterProjectsIcon />} title={localize('futureProjects', 'Future Projects')} />
        <div className={desktopStyles.FutureProjectsPageContent}>
          <DesktopProjectList
            projects={futureProjects}
            emptyStateLabel={localize('futureProjects.empty', 'No future projects')}
          />
        </div>
      </div>
    </div>
  );
};
