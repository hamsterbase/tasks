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

export const RegisterPage: React.FC = () => {
  const cloudService = useService(ICloudService);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage(localize('login.error.passwordMismatch', 'Confirm password should be the same as password'));
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage(localize('login.error.termsRequired', 'You must agree to the terms'));
      return;
    }

    setIsLoading(true);
    try {
      await cloudService.register(account, password);
      setAccount('');
      setPassword('');
      setConfirmPassword('');
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
            title={localize('register.title', 'Create Account')}
            description={localize('register.subtitle', 'Sign up and enjoy 30 days of free cloud sync!')}
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

          <InputField
            type="password"
            placeholder={localize('register.confirmPassword.placeholder', 'Enter your password again')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Checkbox checked={agreedToTerms} onChange={setAgreedToTerms}>
            {localize('register.agree', 'I agree to')}
            <Link to="/desktop/settings/account/eula" className={desktopStyles.AuthFormLink}>
              {localize('register.eula', 'EULA')}
            </Link>
            {localize('register.and', 'and')}
            <Link to="/desktop/settings/account/privacy" className={desktopStyles.AuthFormLink}>
              {localize('register.privacyPolicy', 'Privacy Policy')}
            </Link>
          </Checkbox>
        </div>

        {errorMessage && <div className={desktopStyles.AuthFormErrorMessage}>{errorMessage}</div>}

        <div className={desktopStyles.AuthFormButtonSection}>
          <SettingButton
            variant="filled"
            color="primary"
            onClick={handleSubmit}
            disabled={isLoading || !account || !password || !confirmPassword || !agreedToTerms}
          >
            {isLoading ? localize('common.loading', 'Loading...') : localize('register.submit', 'Create Account')}
          </SettingButton>
          <div className={desktopStyles.AuthFormFooterContainer}>
            <p className={desktopStyles.AuthFormFooterText}>
              {localize('register.hasAccount', 'Already have an account?')}
              <Link className={desktopStyles.AuthFormSwitchButton} to="/desktop/settings/account/login" replace>
                {localize('register.signIn', 'Sign in')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </SettingsContent>
  );
};
