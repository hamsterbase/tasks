import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { InboxIcon, LogIcon, ScheduledIcon, TodayIcon } from '@/components/icons';
import { getInboxTasks } from '@/core/state/inbox/getInboxTasks';
import { getTodayItems } from '@/core/state/today/getTodayItems';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import useNavigate from '@/hooks/useNavigate';
import { StatCard } from '@/mobile/components/StatCard';
import { useTaskDisplaySettingsMobile } from '@/mobile/hooks/useTaskDisplaySettings';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { INavigationService } from '@/services/navigationService/common/navigationService';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import React from 'react';

export const MobileHomeTopMenu = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const todayItems = getTodayItems(todoService.modelState, getTodayTimestampInUtc());
  const navigationService = useService(INavigationService);
  const { showFutureTasks, showCompletedTasks, completedAfter } = useTaskDisplaySettingsMobile('inbox');
  const { uncompletedTasksCount } = getInboxTasks(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    showFutureTasks,
    showCompletedTasks,
    showCompletedTasksAfter: completedAfter,
    keepAliveElements: todoService.keepAliveElements,
  });
  const navigate = useNavigate();
  return (
    <div className={styles.screenEdgePadding}>
      <nav className={styles.statCardContainer}>
        <StatCard
          icon={<TodayIcon className={styles.statCardIcon} />}
          label={localize('today', 'Today')}
          variant="Today"
          count={todayItems.startDateItemsCount}
          overdueCount={todayItems.dueDateItemsCount}
          onClick={() => navigate({ path: '/today' })}
        />
        <StatCard
          icon={<InboxIcon className={styles.statCardIcon} />}
          label={localize('inbox', 'Inbox')}
          variant="Inbox"
          count={uncompletedTasksCount}
          onClick={() => navigationService.navigate({ path: '/inbox' })}
        />
        <StatCard
          icon={<ScheduledIcon className={styles.statCardIcon} />}
          label={localize('schedule', 'Schedule')}
          variant="Scheduled"
          onClick={() => navigate({ path: '/scheduled' })}
        />
        <StatCard
          icon={<LogIcon className={styles.statCardIcon} />}
          label={localize('completed_tasks.title', 'Completed')}
          variant="Completed"
          onClick={() => navigate({ path: '/completed' })}
        />
      </nav>
    </div>
  );
};
