import { Event } from 'vscf/base/common/event';
import { createDecorator } from 'vscf/platform/instantiation/common';

export type IThirdpartySyncServerConfig = {
  type: 'selfhosted';
  id: string;
  folder: string;
  entrypoint: string;
  authToken: string;
};

export interface IThirdpartySyncService {
  readonly _serviceBrand: undefined;

  readonly hasServer: boolean;
  readonly enabled: boolean;
  readonly syncing: boolean;
  readonly showSyncIcon: boolean;
  readonly config: IThirdpartySyncServerConfig | null;

  onStateChange: Event<void>;

  addServer(config: Omit<IThirdpartySyncServerConfig, 'id'>): Promise<string>;

  deleteServer(): Promise<void>;

  sync(): Promise<void>;

  init(): Promise<void>;
}

export const IThirdpartySyncService = createDecorator<IThirdpartySyncService>('IThirdpartySyncService');
