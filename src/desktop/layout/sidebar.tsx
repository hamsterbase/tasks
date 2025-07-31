import { SelectionPanel } from '@/desktop/components/selectionPanel/SelectionPanel';
import { SidebarContent } from '@/desktop/components/sidebar/SidebarContent';
import { useConfig } from '@/hooks/useConfig';
import { detailPanelConfigKey, mainSidebarWidthConfigKey } from '@/services/config/config';
import { Allotment } from 'allotment';
import React from 'react';
import { Outlet } from 'react-router';

interface SidebarLayoutProps {
  hideSelectionPanel?: boolean;
}

export const SidebarLayout = ({ hideSelectionPanel = false }: SidebarLayoutProps) => {
  const mainSidebarConfig = useConfig(mainSidebarWidthConfigKey());
  const detailPanelConfig = useConfig(detailPanelConfigKey());

  return (
    <div className="h-screen w-screen relative">
      <Allotment defaultSizes={mainSidebarConfig.value} onChange={mainSidebarConfig.saveIfValid}>
        <Allotment.Pane minSize={180} maxSize={512} snap preferredSize={240}>
          <SidebarContent />
        </Allotment.Pane>
        <Allotment.Pane>
          <Allotment defaultSizes={detailPanelConfig.value} onChange={detailPanelConfig.saveIfValid}>
            <Allotment.Pane>
              <Outlet />
            </Allotment.Pane>
            {!hideSelectionPanel && (
              <Allotment.Pane minSize={180} maxSize={512} preferredSize={250} snap>
                <SelectionPanel />
              </Allotment.Pane>
            )}
          </Allotment>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
