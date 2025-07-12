import { LoginForm } from '@/desktop/components/auth/LoginForm';
import { RegisterForm } from '@/desktop/components/auth/RegisterForm';
import { useService } from '@/hooks/use-service';
import { useSessionStorageState } from '@/hooks/use-session-storage-state';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import { format } from 'date-fns';
import React from 'react';
import useSWR from 'swr';

enum LoginMode {
  Login = 'login',
  Register = 'register',
}

export const AccountSettings: React.FC = () => {
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);

  const [mode, setMode] = useSessionStorageState<LoginMode>('loginMode', LoginMode.Login);

  const { data: userInfo } = useSWR(
    cloudService.config.type === 'login' ? 'cloudService.userInfo' : null,
    async () => await cloudService.userInfo(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const isLoggedIn = cloudService.config.type !== 'not_login';

  const handleCopyAccountId = () => {
    if (userInfo?.accountId) {
      navigator.clipboard.writeText(userInfo.accountId);
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

  const handleOpenPrivacy = () => {
    window.open('#/desktop/privacy', '_blank', 'width=800,height=600');
  };

  const handleOpenEULA = () => {
    window.open('#/desktop/eula', '_blank', 'width=800,height=600');
  };

  const formatExpiryDate = (timestamp: number) => {
    const localDate = new Date(timestamp);
    return format(localDate, 'yyyy-MM-dd HH:mm:ss');
  };

  if (!isLoggedIn) {
    return (
      <div className="p-6 space-y-6 flex justify-center">
        <div className="max-w-md w-full">
          {mode === LoginMode.Login ? (
            <LoginForm onSwitchToRegister={() => setMode(LoginMode.Register)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode(LoginMode.Login)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 flex justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-bg2 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-medium text-t1 mb-4">{localize('account.title', 'Account')}</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-t2">{localize('account.email', 'Email')}</span>
              <span className="text-t1">
                {cloudService.config.type === 'login' ? cloudService.config.account : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-t2">{localize('account.id', 'ID')}</span>
              <button onClick={handleCopyAccountId} className="text-accent hover:underline">
                {userInfo?.accountId || '-'}
              </button>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-t2">{localize('account.expiry', 'Pro Expires')}</span>
              <span className="text-t1">{userInfo ? formatExpiryDate(userInfo.expiresAt) : '-'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex space-x-3">
            <button
              onClick={handleOpenPrivacy}
              className="flex-1 py-2 px-4 bg-bg3 text-t1 rounded-md hover:bg-bg3/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              {localize('account.privacy', 'Privacy Policy')}
            </button>
            <button
              onClick={handleOpenEULA}
              className="flex-1 py-2 px-4 bg-bg3 text-t1 rounded-md hover:bg-bg3/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              {localize('account.eula', 'EULA')}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-accent text-t1 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            {localize('account.logout', 'Log out')}
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {localize('account.delete', 'Delete Account')}
          </button>
        </div>
      </div>
    </div>
  );
};
