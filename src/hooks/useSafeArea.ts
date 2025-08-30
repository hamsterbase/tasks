import { PRIVACY_AGREEMENT_KEY } from '@/base/common/privacy';
import { useService } from '@/hooks/use-service';
import { ISwitchService } from '@/services/switchService/common/switchService';
import { useEffect } from 'react';

export const useSafeArea = () => {
  const switchService = useService(ISwitchService);

  useEffect(() => {
    (async function () {
      if (switchService.getLocalSwitch('showPrivacyAgreementOverlay')) {
        const hasShown = localStorage.getItem(PRIVACY_AGREEMENT_KEY);
        if (!hasShown) {
          return;
        }
      }
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
