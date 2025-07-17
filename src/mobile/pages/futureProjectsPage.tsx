import { getTodayTimestampInUtc } from '@/base/common/time';
import { BackIcon, LaterProjectsIcon } from '@/components/icons';
import { getFutureProjects } from '@/core/state/home/getFutureProjects';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { useBack } from '@/hooks/useBack';
import { HomeProjectItem } from '@/mobile/components/todo/HomeProjectItem';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { localize } from '@/nls';
import React from 'react';
import { PageLayout } from '../components/PageLayout';
import classNames from 'classnames';
import { styles } from '../theme';

export const FutureProjectsPage = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  const futureProjects = getFutureProjects(todoService.modelState, getTodayTimestampInUtc());
  const handleBack = useBack();

  return (
    <PageLayout
      header={{
        title: localize('futureProjects', 'Future Projects'),
        renderIcon: (className) => <LaterProjectsIcon className={className} />,
        id: 'future-projects',
      }}
      bottomMenu={{
        left: {
          icon: <BackIcon />,
          status: 'normal',
          onClick: handleBack,
        },
      }}
    >
      <div className={classNames(styles.taskItemGroupBackground, styles.taskItemGroupRound)}>
        {futureProjects.map((project) => (
          <HomeProjectItem projectInfo={project} key={project.id} />
        ))}
      </div>
    </PageLayout>
  );
};
