import { CloudIcon, CloudOffIcon, DatabaseIcon, SettingsIcon } from '@/components/icons';
import { useService } from '@/hooks/use-service.ts';
import { useWatchEvent } from '@/hooks/use-watch-event.ts';
import { useConfig } from '@/hooks/useConfig';
import useNavigate from '@/hooks/useNavigate';
import { ListItemGroup, ListItemOption } from '@/mobile/components/listItem/listItem';
import { PageLayout } from '@/mobile/components/PageLayout.tsx';
import { localize } from '@/nls.ts';
import { formatReason, ICloudService } from '@/services/cloud/common/cloudService';
import { chinaServerConfigKey } from '@/services/config/config';
import classNames from 'classnames';
import React from 'react';
import useSWR from 'swr';
import { styles } from '../../theme';

export const CloudSettings = () => {
  const navigate = useNavigate();
  const cloudService = useService(ICloudService);
  useWatchEvent(cloudService.onSessionChange);

  const {
    data: databases,
    error,
    isLoading,
    mutate,
  } = useSWR(
    'cloud-databases',
    async () => {
      return cloudService.listDatabases();
    },
    {
      revalidateOnFocus: true,
    }
  );

  const isLoggedIn = cloudService.config.type !== 'not_login';
  const cloudDatabasesCount = databases?.filter((db) => db.type === 'cloud').length || 0;
  const handleCreateDatabase = () => {
    navigate({ path: '/settings/create-database' });
  };

  const chinaServer = useConfig(chinaServerConfigKey());

  // Prepare account management items
  const accountItems: ListItemOption[] = [
    {
      title: localize('settings.account.management', 'Account Management'),
      onClick: () => {
        if (cloudService.config.type === 'not_login') {
          navigate({ path: '/settings/login' });
        } else {
          navigate({ path: '/settings/account' });
        }
      },
      mode: {
        type: 'navigation' as const,
      },
    },
    {
      hidden: globalThis.language !== 'zh-CN',
      title: localize('settings.cloud.chinaServer', 'Use China Server'),
      onClick: () => {
        chinaServer.setValue(!chinaServer.value);
        mutate();
      },
      mode: {
        type: 'switch',
        checked: chinaServer.value,
      },
    },
  ];

  // Prepare database items
  const databaseItems =
    !isLoading && databases
      ? databases.map((db) => ({
          icon:
            db.type === 'cloud' ? (
              <CloudIcon className={styles.settingsDatabaseIcon} />
            ) : db.type === 'local' ? (
              <DatabaseIcon className={styles.settingsDatabaseIcon} />
            ) : (
              <CloudOffIcon className={styles.settingsDatabaseIcon} />
            ),
          title: db.databaseName,
          description:
            db.type === 'offline'
              ? formatReason(db.reason)
              : db.type === 'local'
                ? localize('settings.local.database', 'Local Database')
                : `${new Date(db.lastModified).toLocaleDateString()} · ${(db.usage / 1024).toFixed(2)} kb`,
          onClick: () => {
            navigate({ path: `/settings/cloud/database/${db.databaseId}` });
          },
          mode: {
            type: 'navigation' as const,
            label:
              db.databaseId === cloudService.databaseConfig
                ? localize('settings.cloud.currentDatabase', 'Current Database')
                : '',
          },
        }))
      : [];

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'cloud',
        title: localize('settings.cloud', 'Cloud'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <div className={styles.settingsPageSections}>
        <ListItemGroup items={accountItems} />

        <div className={styles.settingsPageSubsections}>
          {isLoading && (
            <div className={classNames(styles.settingsStatusState, styles.settingsStatusTextMuted)}>
              {localize('settings.cloud.loading', 'Loading...')}
            </div>
          )}

          {error && (
            <div className={classNames(styles.settingsStatusState, styles.settingsStatusTextDanger)}>
              {localize('settings.cloud.error', 'Failed to load databases')}
            </div>
          )}

          {!isLoading && databases && databases.length > 0 && (
            <ListItemGroup
              title={localize('settings.cloud.database', 'Database')}
              items={(databaseItems as ListItemOption[]).concat([
                {
                  hidden: !isLoggedIn || cloudDatabasesCount >= 3,
                  title: localize('settings.cloud.createDatabase', 'Create CloudDatabase'),
                  onClick: handleCreateDatabase,
                  mode: {
                    type: 'button',
                    theme: 'primary',
                    align: 'center',
                  },
                } as ListItemOption,
              ])}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};
