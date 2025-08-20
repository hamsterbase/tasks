import { SidebarContent } from '@/desktop/components/sidebar/SidebarContent';
import { useConfig } from '@/hooks/useConfig';
import { mainSidebarWidthConfigKey } from '@/services/config/config';
import { Allotment } from 'allotment';
import React from 'react';
import { Outlet } from 'react-router';

export const SidebarLayout = () => {
  const mainSidebarConfig = useConfig(mainSidebarWidthConfigKey());

  return (
    <div className="h-screen w-screen relative">
      <Allotment defaultSizes={mainSidebarConfig.value} onChange={mainSidebarConfig.saveIfValid}>
        <Allotment.Pane minSize={180} maxSize={512} snap preferredSize={240}>
          <SidebarContent />
        </Allotment.Pane>
        <Allotment.Pane className="p-4 pl-0 bg-bg3">
          <div className="bg-bg1 rounded-lg overflow-hidden border border-line-regular h-full">
            <Outlet />
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
