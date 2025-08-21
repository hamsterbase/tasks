import { AreaIcon, HomeIcon } from '@/components/icons';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { getFilteredProjectsAndAreas } from '@/core/state/getFilteredProjectsAndAreas';
import { getTreeSelectItems, TreeSelectItem } from '@/core/state/getTreeSelectItems';
import { OverlayContainer } from '@/desktop/components/Overlay/OverlayContainer';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import { TreeID } from 'loro-crdt';
import React, { useEffect, useRef, useState } from 'react';
import { TreeSelectController } from './TreeSelectController';

interface TreeSelectContentProps {
  controller: TreeSelectController;
}

const TreeSelectContent: React.FC<TreeSelectContentProps> = ({ controller }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const [searchText, setSearchText] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const filteredData = getFilteredProjectsAndAreas(
    todoService.modelState,
    searchText,
    controller.currentItemId as TreeID
  );

  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.focus();
    }
  }, []);

  const handleConfirmSelection = (id: TreeID | null) => {
    controller.confirmSelection(id);
  };

  const flattenedItems = getTreeSelectItems(filteredData);

  const renderIcon = (item: TreeSelectItem) => {
    switch (item.type) {
      case 'root':
        return <HomeIcon className={desktopStyles.TreeSelectOverlayIcon} />;
      case 'area':
        return <AreaIcon className={desktopStyles.TreeSelectOverlayIcon} />;
      case 'project':
        return (
          <ProjectStatusBox
            progress={item.progress}
            status={item.status}
            color="t2"
            className={desktopStyles.TreeSelectOverlayIcon}
          />
        );
    }
  };

  return (
    <OverlayContainer
      zIndex={controller.zIndex}
      onDispose={() => controller.dispose()}
      left={controller.x}
      top={controller.y}
      className={desktopStyles.TreeSelectOverlayContainer}
    >
      <div ref={overlayRef} className={desktopStyles.TreeSelectOverlayInnerWrapper} tabIndex={0}>
        <div className={desktopStyles.TreeSelectOverlayInputWrapper}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={localize('project_area_selector.search', 'Search projects and areas...')}
            className={desktopStyles.TreeSelectOverlayInput}
            autoFocus
          />
        </div>

        <div className={desktopStyles.TreeSelectOverlayContentArea}>
          {flattenedItems.map((item) => (
            <button
              key={item.id || 'root'}
              className={classNames(
                desktopStyles.TreeSelectOverlayButton,
                item.disabled ? desktopStyles.TreeSelectOverlayButtonDisabled : ''
              )}
              disabled={item.disabled}
              onClick={() => !item.disabled && handleConfirmSelection(item.id)}
            >
              {renderIcon(item)}
              <span className={desktopStyles.TreeSelectOverlayText}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </OverlayContainer>
  );
};

export const TreeSelectOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: TreeSelectController | null = workbenchOverlayService.getOverlay(OverlayEnum.treeSelect);
  if (!controller) return null;

  return <TreeSelectContent controller={controller} />;
};
