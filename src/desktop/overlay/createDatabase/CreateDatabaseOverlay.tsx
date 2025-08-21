import { getDeleteDatabaseErrorMessage } from '@/base/common/error';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { Overlay } from '@/desktop/components/Overlay/Overlay';
import { InputField } from '@/desktop/components/Form/InputField/InputField';
import { Checkbox } from '@/desktop/components/Form/Checkbox/Checkbox';
import React, { useState } from 'react';
import { CreateDatabaseController } from './CreateDatabaseController';

const CreateDatabaseContent: React.FC<{ controller: CreateDatabaseController }> = ({ controller }) => {
  const [databaseName, setDatabaseName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [passwordReadOnly, setPasswordReadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const cloudService = useService(ICloudService);

  const isFormValid = databaseName && password && passwordRepeat === password && passwordReadOnly;

  const handleCreateDatabase = async () => {
    if (isLoading || !isFormValid) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await cloudService.createDatabase(databaseName, password);
      controller.handleSuccess();
    } catch (error) {
      setError(getDeleteDatabaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Overlay
      title={localize('settings.createDatabase.title', 'Create Cloud Database')}
      onClose={() => controller.handleCancel()}
      onCancel={() => controller.handleCancel()}
      onConfirm={handleCreateDatabase}
      cancelText={localize('cancel', 'Cancel')}
      confirmText={
        isLoading
          ? localize('common.loading', 'Loading...')
          : localize('settings.createDatabase.createAndUse', 'Create and Use')
      }
      zIndex={controller.zIndex}
      cancelDisabled={isLoading}
      confirmDisabled={!isFormValid || isLoading}
    >
      <div className="flex flex-col gap-3">
        <InputField
          type="text"
          placeholder={localize('settings.createDatabase.databaseName', 'Database')}
          value={databaseName}
          onChange={(e) => setDatabaseName(e.target.value)}
        />

        <InputField
          type="password"
          placeholder={localize('settings.createDatabase.password', 'Password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <InputField
          type="password"
          placeholder={localize('settings.createDatabase.passwordRepeat', 'Password Repeat')}
          value={passwordRepeat}
          onChange={(e) => setPasswordRepeat(e.target.value)}
        />

        <Checkbox checked={passwordReadOnly} onChange={setPasswordReadOnly}>
          {localize(
            'settings.createDatabase.passwordReadOnly',
            'Password cannot be modified. Data will be permanently lost if forgotten.'
          )}
        </Checkbox>

        {error && <div className="text-stress-red text-sm">{error}</div>}
      </div>
    </Overlay>
  );
};

export const CreateDatabaseOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: CreateDatabaseController | null = workbenchOverlayService.getOverlay(OverlayEnum.createDatabase);
  useWatchEvent(controller?.onStatusChange);
  if (!controller) return null;

  return <CreateDatabaseContent controller={controller} />;
};
