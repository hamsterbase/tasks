import { PRIVACY_AGREEMENT_KEY } from '@/base/common/privacy';
import { useService } from '@/hooks/use-service';
import useNavigate from '@/hooks/useNavigate';
import { localize } from '@/nls';
import { ISwitchService } from '@/services/switchService/common/switchService';
import React, { useEffect, useState } from 'react';
import { styles } from '../theme';
import { MobileButton } from './MobileButton';

export const PrivacyAgreementOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const switchService = useService(ISwitchService);

  useEffect(() => {
    const hasShown = localStorage.getItem(PRIVACY_AGREEMENT_KEY);
    if (!hasShown && switchService.getLocalSwitch('showPrivacyAgreementOverlay')) {
      setIsVisible(true);
    }
  }, [switchService]);

  const handleAgree = () => {
    localStorage.setItem(PRIVACY_AGREEMENT_KEY, 'true');
    setIsVisible(false);
    window.location.reload();
  };

  const handleDisagree = () => {
    localStorage.setItem(PRIVACY_AGREEMENT_KEY, 'true');
    setIsVisible(false);
    window.location.reload();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.privacyOverlayContainer}>
      <div className={styles.privacyOverlayModal}>
        <h1 className={styles.privacyOverlayTitle}>{localize('privacy_and_EUAL', 'Privacy Policy and EULA')}</h1>

        <div className={styles.privacyOverlayContent}>
          <p className={styles.privacyOverlayExplanation}>
            {localize('legal_agreement_explanation', 'To use HamsterBase, you must first review and agree to our:')}
          </p>
          <div className={styles.privacyOverlayLinkList}>
            <p onClick={() => navigate({ path: '/settings/privacy' })} className={styles.privacyOverlayLink}>
              • {localize('privacy_policy', 'Privacy Policy')}
            </p>
            <p onClick={() => navigate({ path: '/settings/privacy' })} className={styles.privacyOverlayLink}>
              • {localize('end_user_license_agreement', 'End User License Agreement')}
            </p>
          </div>
          <p className={styles.privacyOverlayExplanation}>
            {localize(
              'agreement_disclaimer',
              'By clicking "Agree", you acknowledge that you have read and agreed to both documents.'
            )}
          </p>
        </div>

        <div className={styles.privacyOverlayButtonContainer}>
          <MobileButton size="large" shape="default" onClick={handleAgree}>
            {localize('agree', 'Agree')}
          </MobileButton>
          <MobileButton size="large" shape="light" onClick={handleDisagree}>
            {localize('disagree', 'Not Now')}
          </MobileButton>
        </div>
      </div>
    </div>
  );
};
