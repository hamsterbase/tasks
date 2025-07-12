import { getLoginErrorMessage } from '@/base/common/error';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import React, { useState } from 'react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
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
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-medium text-t1 mb-2">{localize('register.title', 'Create Account')}</h2>
        <p className="text-sm text-t2">
          {localize('register.subtitle', 'Join us today! Create your account to get started.')}
        </p>
      </div>

      <input
        type="text"
        className="w-full px-3 py-2 border border-line-light rounded-md bg-bg1 text-t1 placeholder-t3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        placeholder={localize('login.account.placeholder', 'Enter your email')}
        value={account}
        onChange={(e) => setAccount(e.target.value)}
      />

      <input
        type="password"
        className="w-full px-3 py-2 border border-line-light rounded-md bg-bg1 text-t1 placeholder-t3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        placeholder={localize('login.password.placeholder', 'Enter your password')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        className="w-full px-3 py-2 border border-line-light rounded-md bg-bg1 text-t1 placeholder-t3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        placeholder={localize('register.confirmPassword.placeholder', 'Enter your password again')}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          className="mr-2 h-4 w-4 text-accent border-line-light rounded focus:ring-accent"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
        />
        <div className="text-sm text-t2">
          {localize('register.agree', 'I agree to')}
          <span className="text-accent mx-1 cursor-pointer hover:underline">{localize('register.eula', 'EULA')}</span>
          {localize('register.and', 'and')}
          <span className="text-accent mx-1 cursor-pointer hover:underline">
            {localize('register.privacyPolicy', 'Privacy Policy')}
          </span>
        </div>
      </div>

      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

      <button
        className="w-full py-2 px-4 bg-accent text-white rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={isLoading || !account || !password || !confirmPassword || !agreedToTerms}
      >
        {isLoading ? localize('common.loading', 'Loading...') : localize('register.submit', 'Create Account')}
      </button>

      <div className="text-center mt-4">
        <p className="text-sm text-t2">
          {localize('register.hasAccount', 'Already have an account?')}
          <button onClick={onSwitchToLogin} className="text-accent hover:underline ml-1">
            {localize('register.signIn', 'Sign in')}
          </button>
        </p>
      </div>
    </div>
  );
};
