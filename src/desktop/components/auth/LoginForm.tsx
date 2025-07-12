import { getLoginErrorMessage } from '@/base/common/error';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import React, { useState } from 'react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const cloudService = useService(ICloudService);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      await cloudService.login(account, password);
      setAccount('');
      setPassword('');
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error as Error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-medium text-t1 mb-2">{localize('login.signIn', 'Sign In')}</h2>
        <p className="text-sm text-t2">{localize('login.subtitle', 'Welcome back! Please sign in to your account.')}</p>
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

      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

      <button
        className="w-full py-2 px-4 bg-accent text-white rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={isLoading || !account || !password}
      >
        {isLoading ? localize('common.loading', 'Loading...') : localize('login.submit', 'Sign In')}
      </button>

      <div className="text-center mt-4">
        <p className="text-sm text-t2">
          {localize('login.noAccount', "Don't have an account?")}
          <button onClick={onSwitchToRegister} className="text-accent hover:underline ml-1">
            {localize('login.createAccount', 'Create one')}
          </button>
        </p>
      </div>
    </div>
  );
};
