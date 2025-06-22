import type {
  DesktopMenuController,
  IMenuConfig,
  IMenuSubmenuConfig,
} from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import React, { useCallback, useEffect, useRef } from 'react';
import { DesktopMenuItemComponent } from './DesktopMenuItemComponent';
import { DesktopSubmenuComponent } from './DesktopSubmenuComponent';
import './commands';

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
      <div className="fixed inset-0" style={{ zIndex: controller.zIndex - 1 }} onClick={handleBackdropClick} />

      <div ref={menuRef} className="fixed outline-none" style={controller.menuStyle} tabIndex={0}>
        <div className="bg-bg1 border border-line-light rounded-lg shadow-lg py-1 w-full">
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
          style={controller.submenuStyle}
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
