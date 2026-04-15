import { explanationRecurringDate } from '@/core/time/explanationRecurringDate';
import { Overlay } from '@/desktop/components/Overlay/Overlay';
import { parseRecurringRule } from '@/core/time/parseRecurringRule';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
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

  if (!controller) return null;

  const placeholder = localize('desktop.recurring_task.placeholder', 'For example 1w, 2m, 1y3d, due:1d, start:2d');
  const startDateRule = controller.startDateRule;
  const dueDateRule = controller.dueDateRule;
  const startDateHasValue = startDateRule.trim().length > 0;
  const dueDateHasValue = dueDateRule.trim().length > 0;
  const startDateIsValid = controller.isStartDateRuleValid;
  const dueDateIsValid = controller.isDueDateRuleValid;
  const startDatePreview =
    startDateHasValue && startDateIsValid ? explanationRecurringDate(parseRecurringRule(startDateRule)) : '';
  const dueDatePreview =
    dueDateHasValue && dueDateIsValid ? explanationRecurringDate(parseRecurringRule(dueDateRule)) : '';
  const startDateNext = startDateIsValid ? controller.getStartDateCalculation() : '';
  const dueDateNext = dueDateIsValid ? controller.getDueDateCalculation() : '';
  const invalidRuleText = localize('desktop.recurring_task.invalid_rule', "Couldn't parse this rule");
  const syntaxHint = localize(
    'desktop.recurring_task.syntax_hint',
    'Format: number + d / w / m / y, optionally prefixed with start: or due:'
  );
  const confirmDisabled = !startDateIsValid || !dueDateIsValid;

  return (
    <Overlay
      title={localize('desktop.recurring_task.title', 'Recurring Settings')}
      onClose={() => controller.dispose()}
      onCancel={() => controller.dispose()}
      onConfirm={() => controller.save()}
      cancelText={localize('common.cancel', 'Cancel')}
      confirmText={localize('confirm', 'Confirm')}
      confirmDisabled={confirmDisabled}
      zIndex={controller.zIndex}
      dataTestId={TestIds.RecurringTaskSettings.Overlay}
      contentClassName={desktopStyles.RecurringTaskSettingsDialogBody}
    >
      <>
        <p className={desktopStyles.RecurringTaskSettingsDialogBodyHint}>
          {localize('desktop.recurring_task.body_hint', 'After completing this task, the next task will be on:')}
        </p>

        <section className={desktopStyles.RecurringTaskSettingsDialogSection}>
          <div className={desktopStyles.RecurringTaskSettingsDialogSectionHeader}>
            <span className={desktopStyles.RecurringTaskSettingsDialogSectionTitle}>
              {localize('desktop.task_detail.start_date', 'Start Date')}
            </span>
            {startDateIsValid ? (
              <span className={desktopStyles.RecurringTaskSettingsDialogSectionHeaderResult}>
                <span className={desktopStyles.RecurringTaskSettingsDialogSummaryArrow}>→</span>
                <span className={desktopStyles.RecurringTaskSettingsDialogSummaryValueEmphasis}>{startDateNext}</span>
              </span>
            ) : (
              <span className={desktopStyles.RecurringTaskSettingsDialogSectionHeaderPlaceholder}>—</span>
            )}
          </div>
          <input
            ref={startDateInputRef}
            className={classNames(desktopStyles.RecurringTaskSettingsDialogInput, {
              [desktopStyles.RecurringTaskSettingsDialogInputDanger]: startDateHasValue && !startDateIsValid,
            })}
            data-test-id={TestIds.RecurringTaskSettings.StartDateInput}
            onChange={(event) => controller.updateStartDateRule(event.target.value)}
            placeholder={placeholder}
            type="text"
            value={startDateRule}
          />
          {startDateHasValue && !startDateIsValid ? (
            <div className={desktopStyles.RecurringTaskSettingsDialogErrorCard}>
              <span className={desktopStyles.RecurringTaskSettingsDialogErrorDescription}>{invalidRuleText}</span>
              <span className={desktopStyles.RecurringTaskSettingsDialogSyntaxHint}>{syntaxHint}</span>
            </div>
          ) : (
            <div className={desktopStyles.RecurringTaskSettingsDialogSummaryCard}>{startDatePreview}</div>
          )}
        </section>

        <section className={desktopStyles.RecurringTaskSettingsDialogSection}>
          <div className={desktopStyles.RecurringTaskSettingsDialogSectionHeader}>
            <span className={desktopStyles.RecurringTaskSettingsDialogSectionTitle}>
              {localize('desktop.task_detail.due_date', 'Due Date')}
            </span>
            {dueDateIsValid ? (
              <span className={desktopStyles.RecurringTaskSettingsDialogSectionHeaderResult}>
                <span className={desktopStyles.RecurringTaskSettingsDialogSummaryArrow}>→</span>
                <span className={desktopStyles.RecurringTaskSettingsDialogSummaryValueEmphasis}>{dueDateNext}</span>
              </span>
            ) : (
              <span className={desktopStyles.RecurringTaskSettingsDialogSectionHeaderPlaceholder}>—</span>
            )}
          </div>
          <input
            className={classNames(desktopStyles.RecurringTaskSettingsDialogInput, {
              [desktopStyles.RecurringTaskSettingsDialogInputDanger]: dueDateHasValue && !dueDateIsValid,
            })}
            data-test-id={TestIds.RecurringTaskSettings.DueDateInput}
            onChange={(event) => controller.updateDueDateRule(event.target.value)}
            placeholder={placeholder}
            type="text"
            value={dueDateRule}
          />
          {dueDateHasValue && !dueDateIsValid ? (
            <div className={desktopStyles.RecurringTaskSettingsDialogErrorCard}>
              <span className={desktopStyles.RecurringTaskSettingsDialogErrorDescription}>{invalidRuleText}</span>
              <span className={desktopStyles.RecurringTaskSettingsDialogSyntaxHint}>{syntaxHint}</span>
            </div>
          ) : (
            <div className={desktopStyles.RecurringTaskSettingsDialogSummaryCard}>{dueDatePreview}</div>
          )}
        </section>
      </>
    </Overlay>
  );
};
