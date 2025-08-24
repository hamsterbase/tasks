import { SettingsSidebarContent } from '@/desktop/components/SettingsSidebarContent/SettingsSidebarContent';
import { desktopStyles } from '@/desktop/theme/main';
import { useConfig } from '@/hooks/useConfig';
import { mainSidebarWidthConfigKey } from '@/services/config/config';
import { Allotment } from 'allotment';
import classNames from 'classnames';
import React from 'react';
import { Outlet } from 'react-router';
import { DragHandle } from '../components/DragHandle';
import { useShouldShowOnDesktopMac } from '../hooks/useShouldShowOnDesktopMac';
import { calculateElementWidth } from '../overlay/datePicker/constant';

export const SettingsSidebarLayout = () => {
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
          <SettingsSidebarContent />
        </Allotment.Pane>
        <Allotment.Pane
          className={classNames(desktopStyles.SidebarLayoutPaneWrapper, {
            [desktopStyles.SidebarLayoutContentCollapsedPadding]: mainSidebarConfig.value[0] === 0,
            [desktopStyles.SidebarLayoutContentShowDragHandle]: showDragHandleInContent,
          })}
        >
          {showDragHandleInContent && <DragHandle />}
          <div className={desktopStyles.SettingsSidebarLayoutContent}>
            <Outlet />
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
