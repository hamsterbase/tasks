import { getDeleteDatabaseErrorMessage } from '@/base/common/error';
import { useService } from '@/hooks/use-service';
import { useBack } from '@/hooks/useBack';
import { useToast } from '@/mobile/overlay/toast/useToast';
import { ICloudService } from '@/services/cloud/common/cloudService';
import React, { useState } from 'react';
import { SettingsIcon } from '../../../components/icons';
import { localize } from '../../../nls';
import { PageLayout } from '../../components/PageLayout';
import { styles } from '../../theme';

export const CreateDatabasePage = () => {
  const [databaseName, setDatabaseName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [passwordReadOnly, setPasswordReadOnly] = useState(false);
  const cloudService = useService(ICloudService);
  const back = useBack();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateDatabase = async () => {
    if (isLoading) {
      return;
    }
    try {
      setIsLoading(true);
      await cloudService.createDatabase(databaseName, password);
      back();
    } catch (error) {
      toast({
        message: getDeleteDatabaseErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = databaseName && password && passwordRepeat === password && passwordReadOnly;

  return (
    <PageLayout
      header={{
        id: 'createDatabase',
        title: localize('settings.createDatabase.title', 'Create Cloud Database'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
      bottomMenu={{
        left: 'back',
      }}
    >
      <div className="flex flex-col gap-3">
        <input
          type="text"
          className={styles.inputItemStyle}
          placeholder={localize('settings.createDatabase.databaseName', 'Database')}
          value={databaseName}
          onChange={(e) => setDatabaseName(e.target.value)}
        />

        <input
          type="password"
          className={styles.inputItemStyle}
          placeholder={localize('settings.createDatabase.password', 'Password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className={styles.inputItemStyle}
          placeholder={localize('settings.createDatabase.passwordRepeat', 'Password Repeat')}
          value={passwordRepeat}
          onChange={(e) => setPasswordRepeat(e.target.value)}
        />

        <div className="flex items-center gap-2 px-3">
          <input
            type="checkbox"
            id="passwordReadOnly"
            className="h-4 w-4 text-primary"
            checked={passwordReadOnly}
            onChange={(e) => setPasswordReadOnly(e.target.checked)}
          />
          <label htmlFor="passwordReadOnly" className="text-sm text-t2">
            {localize(
              'settings.createDatabase.passwordReadOnly',
              'Password cannot be modified. Data will be permanently lost if forgotten.'
            )}
          </label>
        </div>

        <button
          className={'mt-6 w-full py-3 px-4 rounded-full font-medium bg-brand text-white disabled:opacity-50'}
          onClick={handleCreateDatabase}
          disabled={!isFormValid}
        >
          {localize('settings.createDatabase.createAndUse', 'Create and Use')}
        </button>
      </div>
    </PageLayout>
  );
};
