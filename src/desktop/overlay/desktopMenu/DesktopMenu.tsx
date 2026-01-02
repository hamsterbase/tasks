import type {
  DesktopMenuController,
  IMenuConfig,
  IMenuSubmenuConfig,
} from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { TestIds } from '@/testIds';
import React, { useCallback, useEffect, useRef } from 'react';
import { DesktopMenuItemComponent } from './DesktopMenuItemComponent';
import { DesktopSubmenuComponent } from './DesktopSubmenuComponent';
import './commands';
import { calculateElementHeight, calculateElementWidth } from '../datePicker/constant';

interface IDesktopMenuContentProps {
  controller: DesktopMenuController;
}

const DesktopMenuContent: React.FC<IDesktopMenuContentProps> = ({ controller }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useWatchEvent(controller.onStatusChange);

  // 在组件挂载时设置焦点
  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.focus();
    }
  }, []);

  const handleItemClick = useCallback(
    (item: IMenuConfig | IMenuSubmenuConfig) => {
      controller.handleItemClick(item);
    },
    [controller]
  );

  const handleBackdropClick = useCallback(() => {
    controller.dispose();
  }, [controller]);

  return (
    <>
      <div
        className={desktopStyles.DesktopMenuBackdrop}
        style={{ zIndex: controller.zIndex - 1 }}
        onClick={handleBackdropClick}
      />

      <div
        ref={menuRef}
        className={desktopStyles.DesktopMenuContainer}
        style={controller.getMenuStyle({
          menuItemHeight: calculateElementHeight(desktopStyles.DesktopMenuItemBase),
          menuWidth: calculateElementWidth(desktopStyles.DesktopMenuContainer),
        })}
        tabIndex={0}
        data-test-id={TestIds.DesktopMenu.Container}
      >
        <div className={desktopStyles.DesktopMenuContent}>
          {controller.menuConfig.map((item, index) => (
            <DesktopMenuItemComponent
              key={index}
              item={item}
              onItemClick={handleItemClick}
              onMouseEnter={() => controller.setActiveIndex(index)}
              isActive={controller.activeIndex === index}
              showCheckmarks={controller.showCheckmarks}
            />
          ))}
        </div>
      </div>

      {controller.activeIndex !== null && controller.activeMenu?.submenu && controller.isSubmenuOpen && (
        <DesktopSubmenuComponent
          submenu={controller.activeMenu.submenu}
          style={controller.getSubmenuStyle({
            menuItemHeight: calculateElementHeight(desktopStyles.DesktopMenuItemBase),
            menuWidth: calculateElementWidth(desktopStyles.DesktopMenuContainer),
          })}
          onItemClick={handleItemClick}
          activeSubmenuIndex={controller.activeSubmenuIndex}
          onMouseEnter={(index) => controller.setActiveSubmenuIndex(index)}
          showCheckmarks={controller.showSubmenuCheckmarks}
        />
      )}
    </>
  );
};

export const DesktopMenu: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: DesktopMenuController | null = workbenchOverlayService.getOverlay(OverlayEnum.desktopMenu);
  if (!controller || !controller.menuConfig) return null;
  return <DesktopMenuContent controller={controller} />;
};
