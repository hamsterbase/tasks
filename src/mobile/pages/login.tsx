import { getLoginErrorMessage } from '@/base/common/error';
import { UserIcon } from '@/components/icons';
import { useService } from '@/hooks/use-service';
import { useSessionStorageState } from '@/hooks/use-session-storage-state';
import { useWatchEvent } from '@/hooks/use-watch-event';
import useNavigate from '@/hooks/useNavigate';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import React, { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Tabbar } from '../components/tabbar';
import { useToast } from '../overlay/toast/useToast';
import { styles } from '../theme';

enum LoginMode {
  Login = 'login',
  Register = 'register',
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useSessionStorageState<LoginMode>('loginMode', LoginMode.Login);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const toast = useToast();

  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);

  const handleSubmit = async () => {
    if (mode === LoginMode.Register && password !== confirmPassword) {
      toast({
        message: localize('login.error.passwordMismatch', 'Confirm password should be the same as password'),
      });
      return;
    }

    if (mode === LoginMode.Register && !agreedToTerms) {
      toast({
        message: localize('login.error.termsRequired', 'You must agree to the terms'),
      });
      return;
    }

    try {
      if (mode === LoginMode.Login) {
        await cloudService.login(account, password);
      } else {
        await cloudService.register(account, password);
      }
      navigate({
        path: '/settings/cloud',
      });
    } catch (error) {
      toast({
        message: getLoginErrorMessage(error as Error),
      });
    }
  };

  return (
    <PageLayout
      header={{
        renderIcon: (className) => <UserIcon className={className} />,
        id: 'login',
        title: localize('login.title', 'Login & Register'),
      }}
      bottomMenu={{
        left: 'back',
      }}
    >
      <div className="flex flex-col gap-3">
        <Tabbar
          options={[
            {
              testid: 'login-tab-signin',
              label: localize('login.tab.signin', 'Sign In'),
              value: LoginMode.Login,
            },
            {
              testid: 'login-tab-register',
              label: localize('login.tab.register', 'Register'),
              value: LoginMode.Register,
            },
          ]}
          value={mode}
          onChange={(value) => setMode(value as LoginMode)}
        />
        <input
          data-testid="login-input-account"
          type="text"
          className={styles.inputItemStyle}
          placeholder={localize('login.account.placeholder', 'Enter your email')}
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <input
          data-testid="login-input-password"
          type="password"
          className={styles.inputItemStyle}
          placeholder={localize('login.password.placeholder', 'Enter your password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === LoginMode.Register && (
          <input
            data-testid="login-input-confirm-password"
            type="password"
            className={styles.inputItemStyle}
            placeholder={localize('register.confirmPassword.placeholder', 'Enter your password again')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        {mode === LoginMode.Register && (
          <div className="flex items-center px-3">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-primary"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <div className="text-sm text-t2">
              {localize('register.agree', 'I agree to')}
              <a className="text-primary mx-1 text-text-link" onClick={() => navigate({ path: '/settings/eula' })}>
                {localize('register.eula', 'EULA')}
              </a>
              {localize('register.and', 'and')}
              <a className="text-primary mx-1 text-text-link" onClick={() => navigate({ path: '/settings/privacy' })}>
                {localize('register.privacyPolicy', 'Privacy Policy')}
              </a>
            </div>
          </div>
        )}
        <button
          data-testid="login-register-button-submit"
          className="mt-6 w-full py-3 px-4 bg-brand text-white rounded-full hover:bg-brand-dark focus:outline-none disabled:opacity-50 font-medium"
          onClick={handleSubmit}
          disabled={!account || !password || (mode === LoginMode.Register && (!confirmPassword || !agreedToTerms))}
        >
          {mode === LoginMode.Register ? localize('register.submit', 'Register') : localize('login.submit', 'Sign In')}
        </button>
      </div>
    </PageLayout>
  );
};
