import { createDecorator } from 'vscf/platform/instantiation/common';

export interface IReminderService {
  readonly _serviceBrand: undefined;

  start(): Promise<void>;
}

export const IReminderService = createDecorator<IReminderService>('reminderService');
