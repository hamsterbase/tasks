import { SidebarContent } from '@/desktop/components/sidebar/SidebarContent';
import { desktopStyles } from '@/desktop/theme/main';
import { useConfig } from '@/hooks/useConfig';
import { mainSidebarWidthConfigKey } from '@/services/config/config';
import { Allotment } from 'allotment';
import classNames from 'classnames';
import React from 'react';
import { Outlet } from 'react-router';
import { calculateElementWidth } from '../overlay/datePicker/constant';

export const SidebarLayout = () => {
  const mainSidebarConfig = useConfig(mainSidebarWidthConfigKey());

  return (
    <div className={desktopStyles.SidebarLayoutContainer}>
      <Allotment defaultSizes={mainSidebarConfig.value} onChange={mainSidebarConfig.saveIfValid}>
        <Allotment.Pane
          minSize={calculateElementWidth(desktopStyles.SidebarMinWidth)}
          maxSize={calculateElementWidth(desktopStyles.SidebarMaxWidth)}
          snap
          preferredSize={calculateElementWidth(desktopStyles.SidebarPreferredWidth)}
        >
          <SidebarContent />
        </Allotment.Pane>
        <Allotment.Pane
          className={classNames(desktopStyles.SidebarLayoutPaneWrapper, {
            [desktopStyles.SidebarLayoutContentCollapsedPadding]: mainSidebarConfig.value[0] === 0,
          })}
        >
          <div className={desktopStyles.SidebarLayoutContent}>
            <Outlet />
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
