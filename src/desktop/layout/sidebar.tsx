import { SidebarContent } from '@/desktop/components/sidebar/SidebarContent';
import { desktopStyles } from '@/desktop/theme/main';
import { useConfig } from '@/hooks/useConfig';
import { mainSidebarWidthConfigKey } from '@/services/config/config';
import { Allotment } from 'allotment';
import classNames from 'classnames';
import React from 'react';
import { Outlet } from 'react-router';
import { DragHandle } from '../components/DragHandle';
import { SettingsSidebarContent } from '../components/SettingsSidebarContent/SettingsSidebarContent';
import { useShouldShowOnDesktopMac } from '../hooks/useShouldShowOnDesktopMac';
import { calculateElementWidth } from '../overlay/datePicker/constant';

interface SidebarLayoutOptions {
  setting: boolean;
}

export const SidebarLayout: React.FC<SidebarLayoutOptions> = ({ setting }) => {
  const mainSidebarConfig = useConfig(mainSidebarWidthConfigKey());
  const shouldShowOnDesktopMac = useShouldShowOnDesktopMac();
  const isSidebarCollapsed = mainSidebarConfig.value[0] === 0;
  const showDragHandleInContent = isSidebarCollapsed && shouldShowOnDesktopMac;

  return (
    <div className={desktopStyles.SidebarLayoutContainer}>
      <Allotment defaultSizes={mainSidebarConfig.value} onChange={mainSidebarConfig.saveIfValid}>
        <Allotment.Pane
          minSize={calculateElementWidth(desktopStyles.SidebarMinWidth)}
          maxSize={calculateElementWidth(desktopStyles.SidebarMaxWidth)}
          snap
          preferredSize={calculateElementWidth(desktopStyles.SidebarPreferredWidth)}
        >
          {setting ? <SettingsSidebarContent /> : <SidebarContent />}
        </Allotment.Pane>
        <Allotment.Pane
          className={classNames(desktopStyles.SidebarLayoutPaneWrapper, {
            [desktopStyles.SidebarLayoutContentCollapsedPadding]: isSidebarCollapsed,
            [desktopStyles.SidebarLayoutContentShowDragHandle]: showDragHandleInContent,
          })}
        >
          {showDragHandleInContent && <DragHandle />}
          <div className={desktopStyles.SidebarLayoutContent}>
            <Outlet />
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
