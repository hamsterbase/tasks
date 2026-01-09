import { SelectionPanel } from '@/desktop/components/selectionPanel/SelectionPanel';
import { desktopStyles } from '@/desktop/theme/main';
import { useConfig } from '@/hooks/useConfig';
import { detailPanelConfigKey } from '@/services/config/config';
import { Allotment } from 'allotment';
import React, { ReactNode } from 'react';
import { calculateElementWidth } from '../overlay/datePicker/constant';

interface DesktopPageProps {
  header: ReactNode;
  children: ReactNode;
  showDetailPanel?: boolean;
}

export const DesktopPage: React.FC<DesktopPageProps> = ({ header, children, showDetailPanel = true }) => {
  const detailPanelConfig = useConfig(detailPanelConfigKey());

  if (!showDetailPanel) {
    return (
      <div className={desktopStyles.DesktopPageContainer}>
        {header}
        <div className={desktopStyles.DesktopPageMainContent}>{children}</div>
      </div>
    );
  }

  return (
    <div className={desktopStyles.DesktopPageContainer}>
      {header}
      <Allotment.Pane className={desktopStyles.DesktopPageContentPane}>
        <Allotment defaultSizes={detailPanelConfig.value} onChange={detailPanelConfig.saveIfValid}>
          <Allotment.Pane className={desktopStyles.DesktopPageMainPane}>
            <div className={desktopStyles.DesktopPageMainContent}>{children}</div>
          </Allotment.Pane>
          <Allotment.Pane
            minSize={calculateElementWidth(desktopStyles.DetailPanelMinWidth)}
            maxSize={calculateElementWidth(desktopStyles.DetailPanelMaxWidth)}
            preferredSize={calculateElementWidth(desktopStyles.DetailPanelPreferredWidth)}
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
