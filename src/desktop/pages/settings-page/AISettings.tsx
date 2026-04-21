import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsItem } from '@/desktop/components/Settings/SettingsItem';
import { SettingsSection } from '@/desktop/components/Settings/SettingsSection';
import { useConfig } from '@/hooks/useConfig';
import { localize } from '@/nls';
import {
  aiApiTokenConfigKey,
  aiApiUrlConfigKey,
  aiModelNameConfigKey,
  hideAIEntryConfigKey,
} from '@/services/config/config';
import React from 'react';

export const AISettings: React.FC = () => {
  const { value: apiUrl, setValue: setApiUrl } = useConfig(aiApiUrlConfigKey());
  const { value: apiToken, setValue: setApiToken } = useConfig(aiApiTokenConfigKey());
  const { value: modelName, setValue: setModelName } = useConfig(aiModelNameConfigKey());
  const { value: hideAIEntry, setValue: setHideAIEntry } = useConfig(hideAIEntryConfigKey());

  return (
    <SettingsContent title={localize('settings.ai', 'AI Assistant')}>
      <SettingsSection title={localize('settings.ai.display', 'Display')}>
        <ItemGroup>
          <SettingsItem
            title={localize('settings.ai.hide_entry', 'Hide AI Chat in Sidebar')}
            description={localize('settings.ai.hide_entry.description', 'Hide the AI Chat entry from the sidebar.')}
            action={{
              type: 'switch',
              currentValue: hideAIEntry,
              onChange: setHideAIEntry,
            }}
          />
        </ItemGroup>
      </SettingsSection>
      <SettingsSection title={localize('settings.ai.api', 'API')}>
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
      </SettingsSection>
    </SettingsContent>
  );
};
