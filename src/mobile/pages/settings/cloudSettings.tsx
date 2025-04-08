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
import React from 'react';
import useSWR from 'swr';

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
              <CloudIcon className="w-5 h-5" />
            ) : db.type === 'local' ? (
              <DatabaseIcon className="w-5 h-5" />
            ) : (
              <CloudOffIcon className="w-5 h-5" />
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
        id: 'cloud',
        title: localize('settings.cloud', 'Cloud'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
      bottomMenu={{
        left: 'back',
      }}
    >
      <div className="flex flex-col space-y-4">
        <ListItemGroup items={accountItems} />

        <div className="flex flex-col space-y-2">
          {isLoading && (
            <div className="p-4 text-center text-t2">{localize('settings.cloud.loading', 'Loading...')}</div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500">
              {localize('settings.cloud.error', 'Failed to load databases')}
            </div>
          )}

          {!isLoading && databases && databases.length > 0 && (
            <ListItemGroup
              title={localize('settings.cloud.database', 'Database')}
              items={(databaseItems as ListItemOption[]).concat([
                {
                  hidden: !isLoggedIn,
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
