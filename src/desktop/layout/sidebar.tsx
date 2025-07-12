import { SelectionPanel } from '@/desktop/components/selectionPanel/SelectionPanel';
import { SidebarContent } from '@/desktop/components/sidebar/SidebarContent';
import { Allotment } from 'allotment';
import React from 'react';
import { Outlet } from 'react-router';

interface SidebarLayoutProps {
  hideSelectionPanel?: boolean;
}

export const SidebarLayout = ({ hideSelectionPanel = false }: SidebarLayoutProps) => {
  return (
    <div className="h-screen w-screen relative">
      <Allotment>
        <Allotment.Pane minSize={180} maxSize={250} snap>
          <SidebarContent />
        </Allotment.Pane>
        <Allotment.Pane>
          <Allotment>
            <Allotment.Pane>
              <Outlet />
            </Allotment.Pane>
            {!hideSelectionPanel && (
              <Allotment.Pane minSize={200} maxSize={350}>
                <SelectionPanel />
              </Allotment.Pane>
            )}
          </Allotment>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
