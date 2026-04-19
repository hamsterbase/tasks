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

export const RegisterPage: React.FC = () => {
  const cloudService = useService(ICloudService);
  const navigate = useNavigate();
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
            className={desktopStyles.AuthFormInput}
          />

          <InputField
            type="password"
            placeholder={localize('login.password.placeholder', 'Enter your password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={desktopStyles.AuthFormInput}
          />

          <InputField
            type="password"
            placeholder={localize('register.confirmPassword.placeholder', 'Enter your password again')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={desktopStyles.AuthFormInput}
          />

          <label className={desktopStyles.CheckboxContainer}>
            <input
              type="checkbox"
              className={desktopStyles.CheckboxInput}
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span className={desktopStyles.CheckboxBox}>
              <svg className={desktopStyles.CheckboxIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
            <span className={desktopStyles.CheckboxLabel}>
              {localize('register.agree', 'I agree to')}
              <Link to="/desktop/settings/account/eula" className={desktopStyles.AuthFormLink}>
                {localize('register.eula', 'EULA')}
              </Link>
              {localize('register.and', 'and')}
              <Link to="/desktop/settings/account/privacy" className={desktopStyles.AuthFormLink}>
                {localize('register.privacyPolicy', 'Privacy Policy')}
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
            className={desktopStyles.AuthFormSubmitButton}
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
