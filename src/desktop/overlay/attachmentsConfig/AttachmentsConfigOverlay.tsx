import { FormFieldInput } from '@/desktop/components/Form/FormFieldInput/FormFieldInput';
import { FormFieldSwitch } from '@/desktop/components/Form/FormFieldSwitch/FormFieldSwitch';
import { Overlay } from '@/desktop/components/Overlay/Overlay';
import { SettingButton } from '@/desktop/components/Settings/Button/Button';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IAttachmentUploadService, S3Config } from '@/services/attachment/common/attachmentUploadService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import React, { useState } from 'react';
import { AttachmentsConfigController } from './AttachmentsConfigController';

interface FormState {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  keyPrefix: string;
  forcePathStyle: boolean;
}

const EMPTY_FORM: FormState = {
  endpoint: '',
  bucket: '',
  region: '',
  accessKeyId: '',
  secretAccessKey: '',
  keyPrefix: '',
  forcePathStyle: false,
};

function toFormState(config: S3Config | null): FormState {
  if (!config) return EMPTY_FORM;
  return {
    endpoint: config.endpoint,
    bucket: config.bucket,
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    keyPrefix: config.keyPrefix ?? '',
    forcePathStyle: !!config.forcePathStyle,
  };
}

function fromFormState(form: FormState): S3Config {
  return {
    endpoint: form.endpoint.trim(),
    bucket: form.bucket.trim(),
    region: form.region.trim(),
    accessKeyId: form.accessKeyId.trim(),
    secretAccessKey: form.secretAccessKey,
    keyPrefix: form.keyPrefix.trim() || undefined,
    forcePathStyle: form.forcePathStyle || undefined,
  };
}

const AttachmentsConfigContent: React.FC<{ controller: AttachmentsConfigController }> = ({ controller }) => {
  const attachmentService = useService(IAttachmentUploadService);
  const showMessage = useDesktopMessage();

  const [form, setForm] = useState<FormState>(() => toFormState(controller.initialConfig));
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const isFormValid =
    form.endpoint.trim() !== '' &&
    form.bucket.trim() !== '' &&
    form.region.trim() !== '' &&
    form.accessKeyId.trim() !== '' &&
    form.secretAccessKey !== '';

  const handleTest = async () => {
    if (!isFormValid) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await attachmentService.testConnection(fromFormState(form));
      if (result.ok) {
        setTestResult({
          ok: true,
          message: localize('attachments.testSuccess', '✓ Connection successful'),
        });
      } else {
        setTestResult({
          ok: false,
          message: result.error ?? localize('attachments.testFailed', 'Connection failed'),
        });
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!isFormValid || saving) return;
    setSaving(true);
    try {
      await attachmentService.setConfig(fromFormState(form));
      showMessage({
        type: 'success',
        message: localize('attachments.saved', 'S3 configuration saved'),
      });
      controller.handleSuccess();
    } catch (error) {
      showMessage({
        type: 'error',
        message: (error as Error).message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay
      title={
        controller.initialConfig
          ? localize('attachments.editTitle', 'Edit S3 Configuration')
          : localize('attachments.addTitle', 'Configure S3 Storage')
      }
      onClose={() => controller.handleCancel()}
      onCancel={() => controller.handleCancel()}
      onConfirm={handleSave}
      cancelText={localize('common.cancel', 'Cancel')}
      confirmText={saving ? localize('attachments.saving', 'Saving…') : localize('attachments.save', 'Save')}
      cancelDisabled={saving}
      confirmDisabled={!isFormValid || saving}
      zIndex={controller.zIndex}
      containerClassName={desktopStyles.AttachmentsDialogContainer}
      contentClassName={desktopStyles.AttachmentsDialogContent}
    >
      <div className={desktopStyles.AttachmentsDialogFields}>
        <FormFieldInput
          label={localize('attachments.endpoint', 'Endpoint URL')}
          required
          type="url"
          value={form.endpoint}
          onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
          placeholder="https://s3.amazonaws.com"
        />

        <FormFieldInput
          label={localize('attachments.bucket', 'Bucket')}
          required
          value={form.bucket}
          onChange={(e) => setForm({ ...form, bucket: e.target.value })}
          placeholder="my-bucket"
        />

        <FormFieldInput
          label={localize('attachments.region', 'Region')}
          required
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
          placeholder="us-east-1"
        />

        <FormFieldInput
          label={localize('attachments.accessKeyId', 'Access Key ID')}
          required
          value={form.accessKeyId}
          onChange={(e) => setForm({ ...form, accessKeyId: e.target.value })}
        />

        <FormFieldInput
          label={localize('attachments.secretAccessKey', 'Secret Access Key')}
          required
          type="password"
          value={form.secretAccessKey}
          onChange={(e) => setForm({ ...form, secretAccessKey: e.target.value })}
        />

        <div className={desktopStyles.AttachmentsDialogTestRow}>
          <SettingButton variant="filled" size="medium" inline onClick={handleTest} disabled={!isFormValid || testing}>
            {testing ? localize('attachments.testing', 'Testing…') : localize('attachments.test', 'Test Connection')}
          </SettingButton>
          {testResult && (
            <span
              className={
                testResult.ok
                  ? desktopStyles.AttachmentsDialogTestResultSuccess
                  : desktopStyles.AttachmentsDialogTestResultError
              }
            >
              {testResult.message}
            </span>
          )}
        </div>

        <FormFieldInput
          label={localize('attachments.keyPrefix', 'Key Prefix')}
          value={form.keyPrefix}
          onChange={(e) => setForm({ ...form, keyPrefix: e.target.value })}
          placeholder="hamsterbase-tasks/"
        />

        <FormFieldSwitch
          label={localize('attachments.forcePathStyleTitle', 'Force Path Style')}
          description={localize(
            'attachments.forcePathStyleDesc',
            'Required for MinIO and some self-hosted S3-compatible servers'
          )}
          checked={form.forcePathStyle}
          onChange={(checked) => setForm({ ...form, forcePathStyle: checked })}
        />
      </div>
    </Overlay>
  );
};

export const AttachmentsConfigOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: AttachmentsConfigController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.attachmentsConfig
  );
  useWatchEvent(controller?.onStatusChange);
  if (!controller) return null;
  return <AttachmentsConfigContent controller={controller} />;
};
