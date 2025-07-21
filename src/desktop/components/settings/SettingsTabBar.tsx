import { localize } from '@/nls';
import React from 'react';
import { Link, useLocation } from 'react-router';

interface Tab {
  id: string;
  label: string;
  path: string;
}

const tabs: Tab[] = [
  {
    id: 'account',
    label: localize('account.title', 'Account'),
    path: '/desktop/settings/account',
  },
  {
    id: 'appearance',
    label: localize('settings.appearance', 'Appearance'),
    path: '/desktop/settings/appearance',
  },
  {
    id: 'import-export',
    label: localize('settings.import_export', 'Import/Export'),
    path: '/desktop/settings/import-export',
  },
  {
    id: 'sync',
    label: localize('settings.sync', 'Sync'),
    path: '/desktop/settings/sync',
  },
];

export const SettingsTabBar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex justify-around">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          to={tab.path}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            currentPath === tab.path
              ? 'text-t1 border-accent'
              : 'text-t2 border-transparent hover:text-t1 hover:border-line-light'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
};
