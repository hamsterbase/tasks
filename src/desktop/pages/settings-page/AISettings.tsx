import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsItem } from '@/desktop/components/Settings/SettingsItem';
import { SettingsTitle } from '@/desktop/components/Settings/SettingsTitle';
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
        <SettingsItem
          title={localize('settings.ai.api_url', 'API URL')}
          description={localize('settings.ai.api_url.description', 'OpenAI compatible API endpoint URL')}
          action={{
            type: 'input',
            inputType: 'url',
            placeholder: 'https://api.deepseek.com',
            currentValue: apiUrl,
            onChange: setApiUrl,
          }}
        />
        <SettingsItem
          title={localize('settings.ai.api_token', 'API Token')}
          description={localize('settings.ai.api_token.description', 'Your API authentication token')}
          action={{
            type: 'input',
            inputType: 'password',
            placeholder: localize('settings.ai.api_token.placeholder', 'Enter your API token'),
            currentValue: apiToken,
            onChange: setApiToken,
          }}
        />
        <SettingsItem
          title={localize('settings.ai.model_name', 'Model Name')}
          description={localize(
            'settings.ai.model_name.description',
            'The AI model to use (e.g., deepseek-chat, gpt-4, gpt-4o)'
          )}
          action={{
            type: 'input',
            inputType: 'text',
            placeholder: 'deepseek-chat',
            currentValue: modelName,
            onChange: setModelName,
          }}
        />
      </ItemGroup>
    </SettingsContent>
  );
};
