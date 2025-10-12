import { Overlay } from '@/desktop/components/Overlay/Overlay';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useEffect, useRef } from 'react';
import { RecurringTaskSettingsController } from './RecurringTaskSettingsController';

export const RecurringTaskSettingsOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: RecurringTaskSettingsController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.desktopRecurringTaskSettings
  );
  useWatchEvent(controller?.onStatusChange);
  const startDateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (controller) {
      startDateInputRef.current?.focus();
    }
  }, [controller]);

  const placeholder = localize('recurring_task.rule_placeholder', 'e.g. 1w, 2m, 1y3d, due:1d, start:2d');

  if (!controller) return null;

  return (
    <Overlay
      title={localize('recurring_task.settings_title', 'Set Recurring Task Rules')}
      zIndex={controller.zIndex}
      onClose={() => controller.dispose()}
      onCancel={() => controller.dispose()}
      confirmDisabled={!controller.isStartDateRuleValid || !controller.isDueDateRuleValid}
      onConfirm={() => {
        controller.save();
      }}
    >
      <div className={desktopStyles.RecurringTaskSettingsOverlayField}>
        <label className={desktopStyles.RecurringTaskSettingsOverlayLabel}>
          {localize('recurring_task.start_date_rule', 'Start Date Rule')}
        </label>
        <input
          ref={startDateInputRef}
          type="text"
          className={desktopStyles.RecurringTaskSettingsOverlayInput}
          value={controller.startDateRule}
          onChange={(e) => controller.updateStartDateRule(e.target.value)}
          placeholder={placeholder}
        />
        {controller.getStartDateExplanation() && (
          <div className={desktopStyles.RecurringTaskSettingsOverlayExplanation}>
            {controller.getStartDateExplanation()}
          </div>
        )}
        {controller.getStartDateCalculation() && (
          <div className={desktopStyles.RecurringTaskSettingsOverlayCalculation}>
            {localize('recurring_task.next_date', 'Next date: {0}', controller.getStartDateCalculation())}
          </div>
        )}
      </div>

      <div className={desktopStyles.RecurringTaskSettingsOverlayField}>
        <label className={desktopStyles.RecurringTaskSettingsOverlayLabel}>
          {localize('recurring_task.due_date_rule', 'Due Date Rule')}
        </label>
        <input
          type="text"
          className={desktopStyles.RecurringTaskSettingsOverlayInput}
          value={controller.dueDateRule}
          onChange={(e) => controller.updateDueDateRule(e.target.value)}
          placeholder={placeholder}
        />
        {controller.getDueDateExplanation() && (
          <div className={desktopStyles.RecurringTaskSettingsOverlayExplanation}>
            {controller.getDueDateExplanation()}
          </div>
        )}
        {controller.getDueDateCalculation() && (
          <div className={desktopStyles.RecurringTaskSettingsOverlayCalculation}>
            {localize('recurring_task.next_date', 'Next date: {0}', controller.getDueDateCalculation())}
          </div>
        )}
      </div>
    </Overlay>
  );
};
