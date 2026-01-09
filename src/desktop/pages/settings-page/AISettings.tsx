import { InputField } from '@/desktop/components/Form/InputField/InputField';
import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsTitle } from '@/desktop/components/Settings/SettingsTitle';
import { Space } from '@/desktop/components/Space/Space';
import { desktopStyles } from '@/desktop/theme/main';
import { useConfig } from '@/hooks/useConfig';
import { localize } from '@/nls';
import { aiApiTokenConfigKey, aiApiUrlConfigKey, aiModelNameConfigKey } from '@/services/config/config';
import React from 'react';

export const AISettings: React.FC = () => {
  const { value: apiUrl, setValue: setApiUrl } = useConfig(aiApiUrlConfigKey());
  const { value: apiToken, setValue: setApiToken } = useConfig(aiApiTokenConfigKey());
  const { value: modelName, setValue: setModelName } = useConfig(aiModelNameConfigKey());

  return (
    <SettingsContent>
      <SettingsTitle title={localize('settings.ai', 'AI Assistant')} />
      <ItemGroup>
        <div className={desktopStyles.SettingsInputGroup}>
          <label className={desktopStyles.SettingsInputLabel}>{localize('settings.ai.api_url', 'API URL')}</label>
          <InputField
            type="url"
            placeholder="https://api.deepseek.com"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
          <p className={desktopStyles.SettingsInputDescription}>
            {localize('settings.ai.api_url.description', 'OpenAI compatible API endpoint URL')}
          </p>
        </div>
      </ItemGroup>
      <Space size="medium" />
      <ItemGroup>
        <div className={desktopStyles.SettingsInputGroup}>
          <label className={desktopStyles.SettingsInputLabel}>{localize('settings.ai.api_token', 'API Token')}</label>
          <InputField
            type="password"
            placeholder={localize('settings.ai.api_token.placeholder', 'Enter your API token')}
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
          />
          <p className={desktopStyles.SettingsInputDescription}>
            {localize('settings.ai.api_token.description', 'Your API authentication token')}
          </p>
        </div>
      </ItemGroup>
      <Space size="medium" />
      <ItemGroup>
        <div className={desktopStyles.SettingsInputGroup}>
          <label className={desktopStyles.SettingsInputLabel}>{localize('settings.ai.model_name', 'Model Name')}</label>
          <InputField
            type="text"
            placeholder="deepseek-chat"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
          <p className={desktopStyles.SettingsInputDescription}>
            {localize('settings.ai.model_name.description', 'The AI model to use (e.g., deepseek-chat, gpt-4, gpt-4o)')}
          </p>
        </div>
      </ItemGroup>
    </SettingsContent>
  );
};
