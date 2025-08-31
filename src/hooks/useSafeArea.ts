import { useService } from '@/hooks/use-service';
import { ISwitchService } from '@/services/switchService/common/switchService';
import { useEffect } from 'react';

export const useSafeArea = () => {
  const switchService = useService(ISwitchService);

  useEffect(() => {
    (async function () {
      const { SafeArea } = await import('capacitor-plugin-safe-area');
      const safeAreaData = await SafeArea.getSafeAreaInsets();
      const { insets } = safeAreaData;
      for (const [key, value] of Object.entries(insets)) {
        document.documentElement.style.setProperty(`--safe-area-inset-${key}`, `${value}px`);
        if (switchService.getLocalSwitch('shouldIgnoreSafeBottom') && key === 'bottom') {
          document.documentElement.style.setProperty(`--safe-area-inset-${key}`, `0px`);
        }
      }
    })();
  }, [switchService]);
};
