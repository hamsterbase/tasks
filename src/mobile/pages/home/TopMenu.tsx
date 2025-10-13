import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { InboxIcon, LogIcon, ScheduledIcon, TodayIcon } from '@/components/icons';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import useNavigate from '@/hooks/useNavigate';
import { useTaskDisplaySettings } from '@/hooks/useTaskDisplaySettings';
import { StatCard } from '@/mobile/components/StatCard';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { INavigationService } from '@/services/navigationService/common/navigationService';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import classNames from 'classnames';
import React from 'react';

export const MobileHomeTopMenu = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const todayItems = getTodayItems(todoService.modelState, getTodayTimestampInUtc());
  const navigationService = useService(INavigationService);
  const { showFutureTasks, showCompletedTasks, completedAfter } = useTaskDisplaySettings('inbox');
  const { uncompletedTasksCount } = getInboxTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    showFutureTasks,
    showCompletedTasks,
    showCompletedTasksAfter: completedAfter,
    keepAliveElements: todoService.keepAliveElements,
  });
  const navigate = useNavigate();
  return (
    <div className={styles.screenEdgePadding + ' pt-3'}>
      <div className={classNames(styles.homeMenuBackground, styles.homeMenuRound)}>
        <button
          onClick={() => {
            navigationService.navigate({ path: '/inbox' });
          }}
          className="w-full"
        >
          <StatCard
            icon={<InboxIcon className={styles.homeMenuIconStyle} />}
            title={localize('inbox', 'Inbox')}
            value={uncompletedTasksCount}
          />
        </button>
        <button onClick={() => navigate({ path: '/today' })} className="w-full">
          <StatCard
            icon={<TodayIcon className={styles.homeMenuIconStyle} />}
            title={localize('today', 'Today')}
            value={todayItems.startDateItemsCount}
            badge={todayItems.dueDateItemsCount}
          />
        </button>

        <button onClick={() => navigate({ path: '/scheduled' })} className="w-full">
          <StatCard
            icon={<ScheduledIcon className={styles.homeMenuIconStyle} />}
            title={localize('schedule', 'Schedule')}
          />
        </button>
        <button onClick={() => navigate({ path: '/completed' })} className="w-full">
          <StatCard
            icon={<LogIcon className={styles.homeMenuIconStyle} />}
            title={localize('completed_tasks.title', 'Completed')}
          />
        </button>
      </div>
    </div>
  );
};
