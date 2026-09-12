import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useConfig } from '@/hooks/useConfig';
import { selfhostedAutoSyncConfigKey } from '@/services/config/config';
import useSWR from 'swr';
import { ISelfhostedSyncService } from '../common/selfhostedSyncService';

type SelfhostedAutoSyncTarget = Pick<ISelfhostedSyncService, 'hasServer' | 'syncing' | 'sync'>;

export async function syncSelfhostedIfIdle(service: SelfhostedAutoSyncTarget): Promise<void> {
  if (!service.hasServer || service.syncing) {
    return;
  }
  await service.sync();
}

export const useSelfhostedAutoSync = () => {
  const selfhostedSyncService = useService(ISelfhostedSyncService);
  useWatchEvent(selfhostedSyncService.onStateChange);
  const { value: autoSync } = useConfig(selfhostedAutoSyncConfigKey());
  const serverId = selfhostedSyncService.config?.id;

  useSWR(
    autoSync && selfhostedSyncService.hasServer && serverId ? ['selfhosted-auto-sync', serverId] : null,
    () => syncSelfhostedIfIdle(selfhostedSyncService),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      focusThrottleInterval: 0,
      dedupingInterval: 0,
    }
  );
};
