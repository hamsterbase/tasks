import { SelectionPanel } from '@/desktop/components/selectionPanel/SelectionPanel';
import { useConfig } from '@/hooks/useConfig';
import { detailPanelConfigKey } from '@/services/config/config';
import { Allotment } from 'allotment';
import React, { ReactNode } from 'react';

interface DesktopPageProps {
  header: ReactNode;
  children: ReactNode;
}

export const DesktopPage: React.FC<DesktopPageProps> = ({ header, children }) => {
  const detailPanelConfig = useConfig(detailPanelConfigKey());

  return (
    <div className="h-full w-full flex flex-col">
      {header}
      <Allotment.Pane className="w-full flex-1">
        <Allotment defaultSizes={detailPanelConfig.value} onChange={detailPanelConfig.saveIfValid}>
          <Allotment.Pane className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5">{children}</div>
          </Allotment.Pane>
          <Allotment.Pane minSize={180} maxSize={512} preferredSize={300} snap className="border-l border-line-regular">
            <SelectionPanel />
          </Allotment.Pane>
        </Allotment>
      </Allotment.Pane>
    </div>
  );
};
