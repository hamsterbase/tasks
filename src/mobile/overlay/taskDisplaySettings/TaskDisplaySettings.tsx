import { taskDisplaySettingOptions } from '@/base/common/TaskDisplaySettings';
import { CalendarRangeIcon, LogIcon, ScheduledIcon } from '@/components/icons';
import { TimeAfterEnum } from '@/core/time/getTimeAfter';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ActionSheet } from '@/mobile/components/ActionSheet';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
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
      groups: [
        {
          items: taskDisplaySettingOptions.completedTasksRange.options.map((option) => ({
            name: option.label,
            description: option.description,
            onClick: () => controller.changeCompletedTasksRange(option.value as TimeAfterEnum),
          })),
        },
      ],
    });
  };

  const getCompletedRangeText = (range: TimeAfterEnum): string => {
    const option = taskDisplaySettingOptions.completedTasksRange.options.find((opt) => opt.value === range);
    return option?.label || '';
  };

  return (
    <ActionSheet zIndex={controller.zIndex} onClose={() => controller.dispose()}>
      <ListItemGroup
        items={[
          {
            hidden: controller.hideShowFutureTasks,
            icon: <ScheduledIcon />,
            title: taskDisplaySettingOptions.showFutureTasks.title,
            mode: { type: 'switch', checked: controller.showFutureTasks },
            onClick: () => controller.toggleShowFutureTasks(),
          },
          {
            icon: <LogIcon />,
            title: taskDisplaySettingOptions.showCompletedTasks.title,
            mode: { type: 'switch', checked: controller.showCompletedTasks },
            onClick: () => controller.toggleShowCompletedTasks(),
          },
          {
            icon: <CalendarRangeIcon />,
            title: taskDisplaySettingOptions.completedTasksRange.title,
            mode: { type: 'label', label: getCompletedRangeText(controller.completedTasksRange) },
            onClick: handleCompleteRangeClick,
          },
        ]}
      />
    </ActionSheet>
  );
};
