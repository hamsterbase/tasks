import { InfoItem } from '@/desktop/components/InfoItem';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsTitle } from '@/desktop/components/Settings/SettingsTitle';
import { Space } from '@/desktop/components/Space/Space';
import { desktopStyles } from '@/desktop/theme/main';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import useSWR from 'swr';

export const AccountSettings: React.FC = () => {
  const cloudService = useService(ICloudService);
  const navigate = useNavigate();
  useWatchEvent(cloudService.onSessionChange);

  const showMessage = useDesktopMessage();

  const { data: userInfo } = useSWR(
    cloudService.config.type === 'login' ? 'cloudService.userInfo' : null,
    async () => await cloudService.userInfo(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const isLoggedIn = cloudService.config.type !== 'not_login';

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/desktop/settings/account/login');
    }
  }, [isLoggedIn, navigate]);

  const handleCopyValue = (value: string) => {
    if (value && value !== '-') {
      navigator.clipboard.writeText(value);
      showMessage({
        type: 'success',
        message: localize('account.copySuccess', 'Copied Successfully'),
      });
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('account');
      location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (cloudService.config.type === 'not_login') {
        throw new Error('Not logged in');
      }
      cloudService.deleteAccount();
    } catch (error) {
      console.error('Delete account failed:', error);
    }
  };

  const formatExpiryDate = (timestamp: number) => {
    const localDate = new Date(timestamp);
    return format(localDate, 'yyyy-MM-dd HH:mm:ss');
  };

  return (
    <SettingsContent>
      <SettingsTitle title={localize('settings.account', 'Account')} />
      <ItemGroup>
        <InfoItem
          label={localize('account.email', 'Email')}
          value={cloudService.config.type === 'login' ? cloudService.config.account : '-'}
        />
        <InfoItem
          label={localize('account.id', 'ID')}
          value={userInfo?.accountId || '-'}
          showCopyButton={true}
          onCopy={handleCopyValue}
        />
        <InfoItem
          label={localize('account.expiry', 'Pro Expires')}
          value={userInfo ? formatExpiryDate(userInfo.expiresAt) : '-'}
        />
      </ItemGroup>
      <Space size="medium"></Space>
      <div className={desktopStyles.AccountSettingsButtonContainer}>
        <SettingButton variant="filled" onClick={handleLogout}>
          {localize('account.logout', 'Log out')}
        </SettingButton>
        <SettingButton color="danger" onClick={handleDeleteAccount}>
          {localize('account.delete', 'Delete Account')}
        </SettingButton>
      </div>
    </SettingsContent>
  );
};
