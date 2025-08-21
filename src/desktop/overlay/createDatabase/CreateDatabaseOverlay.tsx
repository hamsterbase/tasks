import { getDeleteDatabaseErrorMessage } from '@/base/common/error';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ICloudService } from '@/services/cloud/common/cloudService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
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
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: controller.zIndex,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-45" />

      <div className="bg-bg1-float rounded-lg shadow-2xl flex flex-col min-w-96 max-w-lg mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg2-float">
          <h3 className="text-lg font-semibold text-t1">
            {localize('settings.createDatabase.title', 'Create Cloud Database')}
          </h3>
          <button onClick={() => controller.handleCancel()} className="text-t3 hover:text-t2 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.207 4.793a1 1 0 0 1 0 1.414L9.414 9l2.793 2.793a1 1 0 0 1-1.414 1.414L8 10.414l-2.793 2.793a1 1 0 0 1-1.414-1.414L6.586 9 3.793 6.207a1 1 0 0 1 1.414-1.414L8 7.586l2.793-2.793a1 1 0 0 1 1.414 0z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              className="w-full px-3 py-2 border border-bg2-float bg-bg2-float rounded text-t1 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
              placeholder={localize('settings.createDatabase.databaseName', 'Database')}
              value={databaseName}
              onChange={(e) => setDatabaseName(e.target.value)}
              autoFocus
            />

            <input
              type="password"
              className="w-full px-3 py-2 border border-bg2-float bg-bg2-float rounded text-t1 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
              placeholder={localize('settings.createDatabase.password', 'Password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              className="w-full px-3 py-2 border border-bg2-float bg-bg2-float rounded text-t1 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
              placeholder={localize('settings.createDatabase.passwordRepeat', 'Password Repeat')}
              value={passwordRepeat}
              onChange={(e) => setPasswordRepeat(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="passwordReadOnly"
                className="h-4 w-4 text-brand"
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

            {error && <div className="text-stress-red text-sm">{error}</div>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 rounded-b-lg">
          <button
            className="px-4 py-2 text-sm font-medium text-t1 bg-bg1-float border border-bg2-float rounded focus:outline-none hover:ring-1 hover:ring-brand transition-colors"
            onClick={() => controller.handleCancel()}
            disabled={isLoading}
          >
            {localize('cancel', 'Cancel')}
          </button>

          <button
            className="px-4 py-2 text-sm font-medium text-white bg-brand border border-brand rounded hover:bg-brand-hover focus:outline-none transition-colors disabled:opacity-50"
            onClick={handleCreateDatabase}
            disabled={!isFormValid || isLoading}
          >
            {isLoading
              ? localize('common.loading', 'Loading...')
              : localize('settings.createDatabase.createAndUse', 'Create and Use')}
          </button>
        </div>
      </div>
    </div>
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
