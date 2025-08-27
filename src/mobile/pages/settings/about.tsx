import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import React, { useEffect, useState } from 'react';
import { SettingsIcon } from '../../../components/icons';
import { localize } from '../../../nls';
import { PageLayout } from '../../components/PageLayout';
import { checkPlatform } from '@/base/browser/checkPlatform';
import AndroidSource from '@/plugins/AndroidSourcePlugin';
import { PROJECT_COMMIT_HASH } from '@/base/common/version';

export const AboutPage = () => {
  const [androidSource, setAndroidSource] = useState<string | null>(null);
  const platform = checkPlatform();

  useEffect(() => {
    if (platform.isAndroid) {
      AndroidSource.getSource()
        .then((result) => {
          setAndroidSource(result.source);
        })
        .catch((error) => {
          console.error('Failed to get AndroidSource:', error);
        });
    }
  }, [platform.isAndroid]);

  const items = [
    {
      title: localize('settings.about.commit', 'Commit'),
      mode: {
        type: 'label' as const,
        label: PROJECT_COMMIT_HASH,
      },
    },
  ];

  if (platform.isNative && platform.isAndroid && androidSource) {
    items.push({
      title: 'AndroidSource',
      mode: {
        type: 'label' as const,
        label: androidSource,
      },
    });
  }

  return (
    <PageLayout
      header={{
        id: 'about',
        title: localize('settings.about', 'About'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
      bottomMenu={{
        left: 'back',
      }}
    >
      <ListItemGroup items={items} />
    </PageLayout>
  );
};
