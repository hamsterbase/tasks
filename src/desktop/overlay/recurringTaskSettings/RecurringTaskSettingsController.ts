import { calculateRecurringDate } from '@/core/time/calculateRecurringDate';
import { explanationRecurringRuleWithFrom } from '@/core/time/explanationRecurringDateWithFrom';
import { formatUTCTimeStampToDate } from '@/core/time/formatUTCTimeStamp';
import { parseRecurringRule } from '@/core/time/parseRecurringRule';
import { recurringToString } from '@/core/time/recurringToString';
import { RecurringRule } from '@/core/type';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { Emitter } from 'vscf/base/common/event';
import { Disposable } from 'vscf/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';
import { getCurrentDateStr } from '@/core/time/getCurrentDateStr';

export class RecurringTaskSettingsController extends Disposable {
  static create(
    defaultConfig: RecurringRule,
    onUpdate: (settings: RecurringRule) => void,
    instantiationService: IInstantiationService
  ) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.desktopRecurringTaskSettings, (options) => {
      const controller = instantiationService.createInstance(
        RecurringTaskSettingsController,
        options,
        defaultConfig,
        onUpdate
      );
      return controller;
    });
  }

  get zIndex() {
    return this.option.index;
  }

  private _startDateRule: string = '';
  private _dueDateRule: string = '';

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor(
    public option: OverlayInitOptions,
    defaultConfig: RecurringRule,
    private onUpdate: (settings: RecurringRule) => void,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService
  ) {
    super();
    this._startDateRule = recurringToString(defaultConfig.startDate);
    this._dueDateRule = recurringToString(defaultConfig.dueDate);
  }

  get startDateRule() {
    return this._startDateRule;
  }

  get dueDateRule() {
    return this._dueDateRule;
  }

  updateStartDateRule(rule: string) {
    this._startDateRule = rule;
    this._onStatusChange.fire();
  }

  updateDueDateRule(rule: string) {
    this._dueDateRule = rule;
    this._onStatusChange.fire();
  }

  getStartDateExplanation(): string {
    return explanationRecurringRuleWithFrom(this._startDateRule);
  }

  get isStartDateRuleValid(): boolean {
    if (!this._startDateRule) return true;
    const parsedRule = parseRecurringRule(this._startDateRule);
    return parsedRule.valid;
  }

  getDueDateExplanation(): string {
    return explanationRecurringRuleWithFrom(this._dueDateRule);
  }

  get isDueDateRuleValid(): boolean {
    if (!this._dueDateRule) return true;
    const parsedRule = parseRecurringRule(this._dueDateRule);
    return parsedRule.valid;
  }

  getStartDateCalculation(): string {
    if (!this._startDateRule || !this.isStartDateRuleValid) return '';
    return formatUTCTimeStampToDate(
      calculateRecurringDate(parseRecurringRule(this._startDateRule), getCurrentDateStr()).getTime()
    );
  }

  getDueDateCalculation(): string {
    if (!this._dueDateRule) return '';
    if (!this.isDueDateRuleValid) return '';
    return formatUTCTimeStampToDate(
      calculateRecurringDate(parseRecurringRule(this._dueDateRule), getCurrentDateStr()).getTime()
    );
  }

  save() {
    if (this.onUpdate) {
      this.onUpdate({
        startDate: this._startDateRule ? parseRecurringRule(this._startDateRule) : null,
        dueDate: this._dueDateRule ? parseRecurringRule(this._dueDateRule) : null,
      });
    }
    this.dispose();
  }

  cancel() {
    this.dispose();
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    super.dispose();
    this._onStatusChange.fire();
  }
}
