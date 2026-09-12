import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ISelfhostedSyncService } from '../common/selfhostedSyncService';

export interface UseSelfhostedSyncOptions {
  onSuccess?(): void;
  onError?(error: Error): void;
}

export const useSelfhostedSync = (options: UseSelfhostedSyncOptions) => {
  const selfhostedSyncService = useService(ISelfhostedSyncService);
  useWatchEvent(selfhostedSyncService.onStateChange);

  return {
    selfhostedSyncService,
    sync: async () => {
      if (!selfhostedSyncService.hasServer || selfhostedSyncService.syncing) {
        return;
      }

      try {
        await selfhostedSyncService.sync();
      } catch (error) {
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
        return;
      }

      options.onSuccess?.();
    },
  };
};
