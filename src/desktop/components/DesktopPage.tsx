import { SelectionPanel } from '@/desktop/components/selectionPanel/SelectionPanel';
import { desktopStyles } from '@/desktop/theme/main';
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
    <div className={desktopStyles.DesktopPageContainer}>
      {header}
      <Allotment.Pane className={desktopStyles.DesktopPageContentPane}>
        <Allotment defaultSizes={detailPanelConfig.value} onChange={detailPanelConfig.saveIfValid}>
          <Allotment.Pane className={desktopStyles.DesktopPageMainPane}>
            <div className={desktopStyles.DesktopPageMainContent}>{children}</div>
          </Allotment.Pane>
          <Allotment.Pane
            minSize={180}
            maxSize={512}
            preferredSize={300}
            snap
            className={desktopStyles.DesktopPageDetailPane}
          >
            <SelectionPanel />
          </Allotment.Pane>
        </Allotment>
      </Allotment.Pane>
    </div>
  );
};
