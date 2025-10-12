import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { localize } from '@/nls';
import React, { useRef, useEffect } from 'react';
import { BaseDialog } from '../../components/BaseDialog';
import { RecurringTaskSettingsDialogController } from './RecurringTaskSettingsDialogController';

export const RecurringTaskSettings: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: RecurringTaskSettingsDialogController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.mobileRecurringTaskSettings
  );
  useWatchEvent(controller?.onStatusChange);
  const startDateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (controller) {
      startDateInputRef.current?.focus();
    }
  }, [controller]);

  if (!controller) return null;

  const placeholder = localize('recurring_task.rule_placeholder', 'e.g. 1w, 2m, 1y3d, due:1d, start:2d');

  return (
    <BaseDialog
      zIndex={controller.zIndex}
      title={localize('recurring_task.settings_title', 'Set Recurring Task Rules')}
      cancelText={localize('common.cancel', 'Cancel')}
      confirmText={localize('common.save', 'Save')}
      onCancel={() => controller.cancel()}
      onConfirm={() => controller.save()}
      confirmDisabled={!controller.isStartDateRuleValid || !controller.isDueDateRuleValid}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-t1 mb-2">
            {localize('recurring_task.start_date_rule', 'Start Date Rule')}
          </label>
          <input
            ref={startDateInputRef}
            type="text"
            className="w-full px-3 py-2 border border-line-light rounded-lg bg-bg2 text-t1 placeholder-t3"
            value={controller.startDateRule}
            onChange={(e) => controller.updateStartDateRule(e.target.value)}
            placeholder={placeholder}
          />
          {controller.getStartDateExplanation() && (
            <div className="mt-2 text-sm text-t2">{controller.getStartDateExplanation()}</div>
          )}
          {controller.getStartDateCalculation() && (
            <div className="mt-2 text-sm text-brand">
              {localize('recurring_task.next_date', 'Next date: {0}', controller.getStartDateCalculation())}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-t1 mb-2">
            {localize('recurring_task.due_date_rule', 'Due Date Rule')}
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-line-light rounded-lg bg-bg2 text-t1 placeholder-t3"
            value={controller.dueDateRule}
            onChange={(e) => controller.updateDueDateRule(e.target.value)}
            placeholder={placeholder}
          />
          {controller.getDueDateExplanation() && (
            <div className="mt-2 text-sm text-t2">{controller.getDueDateExplanation()}</div>
          )}
          {controller.getDueDateCalculation() && (
            <div className="mt-2 text-sm text-brand">
              {localize('recurring_task.next_date', 'Next date: {0}', controller.getDueDateCalculation())}
            </div>
          )}
        </div>
      </div>
    </BaseDialog>
  );
};
