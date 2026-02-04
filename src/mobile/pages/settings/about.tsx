import { checkPlatform } from '@/base/browser/checkPlatform';
import { PROJECT_COMMIT_HASH } from '@/base/common/version';
import { ListItemGroup, ListItemOption } from '@/mobile/components/listItem/listItem';
import AndroidSource from '@/plugins/AndroidSourcePlugin';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { SettingsIcon } from '../../../components/icons';
import { localize } from '../../../nls';
import { PageLayout } from '../../components/PageLayout';

export const AboutPage = () => {
  const [androidSource, setAndroidSource] = useState<string | null>(null);
  const platform = checkPlatform();
  const navigate = useNavigate();

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

  const items: ListItemOption[] = [
    {
      title: localize('settings.about.commit', 'Commit'),
      mode: {
        type: 'label',
        label: PROJECT_COMMIT_HASH.slice(0, 16),
      },
    },
    {
      title: localize('privacy_policy', 'Privacy Policy'),
      onClick: () => navigate('/settings/privacy'),
      mode: {
        type: 'navigation',
      },
    },
    {
      title: localize('settings.feedback', 'Customer Feedback'),
      onClick: () => navigate('/settings/feedback'),
      mode: {
        type: 'navigation',
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
        showBack: true,
        id: 'about',
        title: localize('settings.about', 'About'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <ListItemGroup items={items} />
    </PageLayout>
  );
};
