import { createDecorator } from 'vscf/platform/instantiation/common';

export interface IDockBadgeService {
  readonly _serviceBrand: undefined;

  /**
   * Start the dock badge service
   * - Subscribes to todo service state changes
   * - Updates badge on every change
   */
  start(): Promise<void>;
}

export const IDockBadgeService = createDecorator<IDockBadgeService>('dockBadgeService');
