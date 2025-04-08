import { CalendarRangeIcon, LogIcon, ScheduledIcon } from '@/components/icons';
import { TimeAfterEnum } from '@/core/time/getTimeAfter';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ActionSheet } from '@/mobile/components/ActionSheet';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import classNames from 'classnames';
import React from 'react';
import { TaskDisplaySettingsController } from './TaskDisplaySettingsController';
import { Switch } from '@/mobile/components/switch';

export const TaskDisplaySettings: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: TaskDisplaySettingsController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.taskDisplaySettings
  );
  useWatchEvent(controller?.onStatusChange);
  const popupAction = usePopupAction();

  if (!controller) return null;

  const handleCompleteRangeClick = () => {
    popupAction({
      items: [
        {
          name: localize('inbox.completed_range.today', 'Today'),
          description: localize('inbox.completed_range.today.description', 'Show tasks completed since start of today'),
          onClick: () => controller.changeCompletedTasksRange('today'),
        },
        {
          name: localize('inbox.completed_range.day', 'Past Day'),
          description: localize(
            'inbox.completed_range.day.description',
            'Show tasks completed since start of yesterday'
          ),
          onClick: () => controller.changeCompletedTasksRange('day'),
        },
        {
          name: localize('inbox.completed_range.week', 'Past Week'),
          description: localize(
            'inbox.completed_range.week.description',
            'Show tasks completed since start of last week'
          ),
          onClick: () => controller.changeCompletedTasksRange('week'),
        },
        {
          name: localize('inbox.completed_range.month', 'Past Month'),
          description: localize(
            'inbox.completed_range.month.description',
            'Show tasks completed since start of last month'
          ),
          onClick: () => controller.changeCompletedTasksRange('month'),
        },
        {
          // 所有完成的任务
          name: localize('inbox.completed_range.all', 'All'),
          description: localize('inbox.completed_range.all.description', 'Show all completed tasks'),
          onClick: () => controller.changeCompletedTasksRange('all'),
        },
      ],
    });
  };

  const getCompletedRangeText = (range: TimeAfterEnum): string => {
    switch (range) {
      case 'today':
        return localize('inbox.completed_range.today.short', 'Today');
      case 'day':
        return localize('inbox.completed_range.day.short', 'Past day');
      case 'week':
        return localize('inbox.completed_range.week.short', 'Past week');
      case 'month':
        return localize('inbox.completed_range.month.short', 'Past month');
      case 'all':
        return localize('inbox.completed_range.all.short', 'All');
      default:
        return '';
    }
  };

  return (
    <ActionSheet zIndex={controller.zIndex} onClose={() => controller.dispose()}>
      <div
        className={classNames('w-full', styles.actionSheetActionGroupRound, styles.actionSheetActionGroupBackground)}
      >
        {!controller.hideShowFutureTasks && (
          <button
            className={classNames(
              'w-full flex items-center justify-between',
              styles.actionSheetActionGroupItemPadding,
              styles.actionSheetActionGroupItemGap
            )}
            onClick={() => controller.toggleShowFutureTasks()}
          >
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 size-5 flex items-center justify-center text-t1">
                <ScheduledIcon className="w-5 h-5" />
              </span>
              <span className="text-sm text-t1">{localize('inbox.show_future_tasks', 'Show Future Tasks')}</span>
            </div>
            <Switch checked={controller.showFutureTasks} />
          </button>
        )}
        <div className="w-[calc(100%-2.5rem)] h-px bg-line-light ml-auto" />
        <button
          className={classNames(
            'w-full flex items-center justify-between',
            styles.actionSheetActionGroupItemPadding,
            styles.actionSheetActionGroupItemGap
          )}
          onClick={() => controller.toggleShowCompletedTasks()}
        >
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 size-5 flex items-center justify-center text-t1">
              <LogIcon className="w-5 h-5" />
            </span>
            <span className="text-sm text-t1">{localize('inbox.show_completed_tasks', 'Show Completed Tasks')}</span>
          </div>
          <Switch checked={controller.showCompletedTasks} />
        </button>
        {
          <>
            <div className="w-[calc(100%-2.5rem)] h-px bg-line-light ml-auto" />
            <button
              className={classNames(
                'w-full flex items-center justify-between',
                styles.actionSheetActionGroupItemPadding,
                styles.actionSheetActionGroupItemGap
              )}
              onClick={handleCompleteRangeClick}
            >
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 size-5 flex items-center justify-center text-t1">
                  <CalendarRangeIcon className="w-5 h-5" />
                </span>
                <span className="text-sm text-t1">
                  {localize('inbox.completed_tasks_range', 'Completed Tasks Range')}
                </span>
              </div>
              <span className="text-sm text-t3">{getCompletedRangeText(controller.completedTasksRange)}</span>
            </button>
          </>
        }
      </div>
    </ActionSheet>
  );
};
