import { Event } from 'vscf/base/common/event';
import { createDecorator } from 'vscf/platform/instantiation/common';

export type ISelfhostedSyncServerConfig = {
  type: 'selfhosted';
  id: string;
  folder: string;
  entrypoint: string;
  authToken: string;
};

export interface ISelfhostedSyncService {
  readonly _serviceBrand: undefined;

  readonly hasServer: boolean;
  readonly enabled: boolean;
  readonly syncing: boolean;
  readonly showSyncIcon: boolean;
  readonly config: ISelfhostedSyncServerConfig | null;
  readonly showCreateButton: boolean;

  onStateChange: Event<void>;

  addServer(config: Omit<ISelfhostedSyncServerConfig, 'id'>): Promise<string>;

  deleteServer(): Promise<void>;

  sync(): Promise<void>;

  init(): Promise<void>;
}

export const ISelfhostedSyncService = createDecorator<ISelfhostedSyncService>('ISelfhostedSyncService');
