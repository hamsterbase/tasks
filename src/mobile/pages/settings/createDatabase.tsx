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
        showBack: true,
        id: 'createDatabase',
        title: localize('settings.createDatabase.title', 'Create Cloud Database'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <div className={styles.formSectionStack}>
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

        <div className={styles.formCheckboxRow}>
          <input
            type="checkbox"
            id="passwordReadOnly"
            className={styles.formCheckbox}
            checked={passwordReadOnly}
            onChange={(e) => setPasswordReadOnly(e.target.checked)}
          />
          <label htmlFor="passwordReadOnly" className={styles.formHintText}>
            {localize(
              'settings.createDatabase.passwordReadOnly',
              'Password cannot be modified. Data will be permanently lost if forgotten.'
            )}
          </label>
        </div>

        <button className={styles.formPrimaryButton} onClick={handleCreateDatabase} disabled={!isFormValid}>
          {localize('settings.createDatabase.createAndUse', 'Create and Use')}
        </button>
      </div>
    </PageLayout>
  );
};
