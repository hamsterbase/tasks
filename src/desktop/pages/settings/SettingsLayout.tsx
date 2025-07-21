import { SettingsIcon } from '@/components/icons';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { SettingsTabBar } from '@/desktop/components/settings/SettingsTabBar';
import { localize } from '@/nls';
import React from 'react';
import { Outlet } from 'react-router';

export const SettingsLayout: React.FC = () => {
  return (
    <div className="h-full w-full bg-bg1">
      <div className="h-full flex flex-col">
        <EntityHeader
          renderIcon={() => <SettingsIcon className="size-5 text-t2" />}
          title={localize('settings', 'Settings')}
        />

        <div className="border-b border-line-light bg-bg1">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl px-4">
              <SettingsTabBar />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
