import { SelectionPanel } from '@/desktop/components/selectionPanel/SelectionPanel';
import { desktopStyles } from '@/desktop/theme/main';
import { useConfig } from '@/hooks/useConfig';
import { detailPanelConfigKey } from '@/services/config/config';
import { Allotment, LayoutPriority } from 'allotment';
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

  const selectionPanel = <SelectionPanel />;

  return (
    <div className={desktopStyles.DesktopPageContainer}>
      <div className={desktopStyles.DesktopPageContentPane}>
        <Allotment
          defaultSizes={detailPanelConfig.value}
          onChange={detailPanelConfig.saveIfValid}
          proportionalLayout={false}
        >
          <Allotment.Pane priority={LayoutPriority.High} className={desktopStyles.DesktopPageMainPane}>
            {header}
            <div className={desktopStyles.DesktopPageMainContent}>{children}</div>
          </Allotment.Pane>
          {selectionPanel && (
            <Allotment.Pane
              minSize={calculateElementWidth(desktopStyles.DetailPanelMinWidth)}
              maxSize={calculateElementWidth(desktopStyles.DetailPanelMaxWidth)}
              preferredSize={calculateElementWidth(desktopStyles.DetailPanelPreferredWidth)}
              snap
              className={desktopStyles.DesktopPageDetailPane}
            >
              {selectionPanel}
            </Allotment.Pane>
          )}
        </Allotment>
      </div>
    </div>
  );
};
