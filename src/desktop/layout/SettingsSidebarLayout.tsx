import { SettingsSidebarContent } from '@/desktop/components/SettingsSidebarContent/SettingsSidebarContent';
import { desktopStyles } from '@/desktop/theme/main';
import { useConfig } from '@/hooks/useConfig';
import { mainSidebarWidthConfigKey } from '@/services/config/config';
import { Allotment } from 'allotment';
import React from 'react';
import { Outlet } from 'react-router';

export const SettingsSidebarLayout = () => {
  const mainSidebarConfig = useConfig(mainSidebarWidthConfigKey());

  return (
    <div className={desktopStyles.SidebarLayoutContainer}>
      <Allotment defaultSizes={mainSidebarConfig.value} onChange={mainSidebarConfig.saveIfValid}>
        <Allotment.Pane minSize={180} maxSize={512} snap preferredSize={240}>
          <SettingsSidebarContent />
        </Allotment.Pane>
        <Allotment.Pane className={desktopStyles.SidebarLayoutPaneWrapper}>
          <div className={desktopStyles.SettingsSidebarLayoutContent}>
            <Outlet />
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
