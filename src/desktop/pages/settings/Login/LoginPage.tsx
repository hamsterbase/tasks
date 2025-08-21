import { getLoginErrorMessage } from '@/base/common/error';
import { Checkbox } from '@/desktop/components/Form/Checkbox/Checkbox';
import { InputField } from '@/desktop/components/Form/InputField/InputField';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsTitle } from '@/desktop/components/Settings/SettingsTitle';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import React, { useState } from 'react';
import { Link } from 'react-router';

export const LoginPage: React.FC = () => {
  const cloudService = useService(ICloudService);
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
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error as Error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContent>
      <div className={desktopStyles.AuthFormContainer}>
        <div className={desktopStyles.AuthFormSection}>
          <SettingsTitle
            title={localize('login.signIn', 'Sign In')}
            description={localize('login.subtitle', 'Welcome back! Please sign in to your account.')}
          />

          <InputField
            type="text"
            placeholder={localize('login.account.placeholder', 'Enter your email')}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />

          <InputField
            type="password"
            placeholder={localize('login.password.placeholder', 'Enter your password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Checkbox checked={agreedToTerms} onChange={setAgreedToTerms}>
            {localize('login.agree', 'I agree to')}
            <Link to="/desktop/settings/account/eula" className={desktopStyles.AuthFormLink}>
              {localize('login.eula', 'EULA')}
            </Link>
            {localize('login.and', 'and')}
            <Link to="/desktop/settings/account/privacy" className={desktopStyles.AuthFormLink}>
              {localize('login.privacyPolicy', 'Privacy Policy')}
            </Link>
          </Checkbox>
        </div>

        {errorMessage && <div className={desktopStyles.AuthFormErrorMessage}>{errorMessage}</div>}

        <div className={desktopStyles.AuthFormButtonSection}>
          <SettingButton
            variant="filled"
            color="primary"
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
