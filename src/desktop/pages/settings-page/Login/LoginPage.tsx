import { getLoginErrorMessage } from '@/base/common/error';
import { InputField } from '@/desktop/components/Form/InputField/InputField';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';

export const LoginPage: React.FC = () => {
  const cloudService = useService(ICloudService);
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      await cloudService.login(account, password);
      setAccount('');
      setPassword('');
      setAgreedToTerms(false);
      navigate('/desktop/settings/account', { replace: true });
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error as Error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContent title={localize('account.title', 'Account')}>
      <div className={desktopStyles.AuthFormContainer}>
        <ItemGroup>
          <InputField
            type="text"
            placeholder={localize('login.account.placeholder', 'Enter your email')}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="block w-full bg-transparent px-4 py-3 text-sm leading-5 text-t1 outline-none transition-colors placeholder:text-t3 focus:bg-bg2"
          />

          <InputField
            type="password"
            placeholder={localize('login.password.placeholder', 'Enter your password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full bg-transparent px-4 py-3 text-sm leading-5 text-t1 outline-none transition-colors placeholder:text-t3 focus:bg-bg2"
          />

          <label className="flex items-center gap-2 px-4 py-3">
            <input
              type="checkbox"
              className="sr-only"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span className="flex h-5 w-4 items-center justify-center text-t3">
              <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="14" height="14" rx="4" ry="4" stroke="currentColor" strokeWidth="1" />
                {agreedToTerms && (
                  <path
                    d="M4.5 8.25 6.75 10.5 11.5 5.75"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </span>
            <span className="text-xs leading-4 text-t3">
              {localize('login.agree', 'I agree to')}
              <Link to="/desktop/settings/account/eula" className={desktopStyles.AuthFormLink}>
                {localize('login.eula', 'EULA')}
              </Link>
              {localize('login.and', 'and')}
              <Link to="/desktop/settings/account/privacy" className={desktopStyles.AuthFormLink}>
                {localize('login.privacyPolicy', 'Privacy Policy')}
              </Link>
            </span>
          </label>
        </ItemGroup>

        {errorMessage && <div className={desktopStyles.AuthFormErrorMessage}>{errorMessage}</div>}

        <div className={desktopStyles.AuthFormButtonSection}>
          <SettingButton
            variant="solid"
            color="primary"
            inline
            className="self-start"
            onClick={handleSubmit}
            disabled={isLoading || !account || !password || !agreedToTerms}
          >
            {isLoading ? localize('common.loading', 'Loading...') : localize('login.submit', 'Sign In')}
          </SettingButton>

          <div className={desktopStyles.AuthFormFooterContainer}>
            <p className={desktopStyles.AuthFormFooterText}>
              {localize('login.noAccount', "Don't have an account?")}
              <Link className={desktopStyles.AuthFormSwitchButton} to="/desktop/settings/account/register" replace>
                {localize('login.createAccount', 'Create one')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </SettingsContent>
  );
};
