import { taskDisplaySettingOptions } from '@/base/common/TaskDisplaySettings';
import { CalendarRangeIcon, LogIcon, ScheduledIcon } from '@/components/icons';
import { TimeAfterEnum } from '@/core/time/getTimeAfter';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ActionSheet } from '@/mobile/components/ActionSheet';
import { Switch } from '@/mobile/components/switch';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { styles } from '@/mobile/theme';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import classNames from 'classnames';
import React from 'react';
import { TaskDisplaySettingsController } from './TaskDisplaySettingsController';

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
      items: taskDisplaySettingOptions.completedTasksRange.options.map((option) => ({
        name: option.label,
        description: option.description,
        onClick: () => controller.changeCompletedTasksRange(option.value as TimeAfterEnum),
      })),
    });
  };

  const getCompletedRangeText = (range: TimeAfterEnum): string => {
    const option = taskDisplaySettingOptions.completedTasksRange.options.find((opt) => opt.value === range);
    return option?.label || '';
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
              <span className="text-sm text-t1">{taskDisplaySettingOptions.showFutureTasks.title}</span>
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
            <span className="text-sm text-t1">{taskDisplaySettingOptions.showCompletedTasks.title}</span>
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
                <span className="text-sm text-t1">{taskDisplaySettingOptions.completedTasksRange.title}</span>
              </div>
              <span className="text-sm text-t3">{getCompletedRangeText(controller.completedTasksRange)}</span>
            </button>
          </>
        }
      </div>
    </ActionSheet>
  );
};
