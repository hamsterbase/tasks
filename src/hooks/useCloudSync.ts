import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ICloudService } from '@/services/cloud/common/cloudService';
import useSWR from 'swr';

export const useCloudSync = () => {
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);

  useSWR(
    'autoSync',
    () => {
      return cloudService.sync();
    },
    {
      refreshInterval: 1000 * 60 * 5,
      revalidateOnFocus: true,
    }
  );
};
