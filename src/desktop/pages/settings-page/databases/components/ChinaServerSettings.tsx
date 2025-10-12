import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsItem } from '@/desktop/components/Settings/SettingsItem';
import { useConfig } from '@/hooks/useConfig.ts';
import { localize } from '@/nls.ts';
import { chinaServerConfigKey } from '@/services/config/config.ts';
import React from 'react';

export const ChinaServerSettings: React.FC = () => {
  const chinaServer = useConfig(chinaServerConfigKey());

  if (globalThis.language !== 'zh-CN') {
    return null;
  }

  return (
    <ItemGroup>
      <SettingsItem
        title={localize('settings.cloud.chinaServer', 'Use China Server')}
        description={localize(
          'settings.cloud.chinaServer.description',
          'Switch to China server for better performance'
        )}
        action={{
          type: 'switch',
          currentValue: chinaServer.value,
          onChange: (v) => {
            chinaServer.setValue(v);
          },
        }}
      />
    </ItemGroup>
  );
};
