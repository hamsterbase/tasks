import { createDecorator } from '@hamsterbase/foundation/instantiation';

export interface IReminderService {
  readonly _serviceBrand: undefined;

  start(): Promise<void>;
}

export const IReminderService = createDecorator<IReminderService>('reminderService');
