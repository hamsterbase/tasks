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
  const menuItemHeight = calculateElementHeight(desktopStyles.DesktopMenuItemBase);
  const defaultMenuWidth = calculateElementWidth(desktopStyles.DesktopMenuContainer);
  const dividerHeight = calculateElementHeight(desktopStyles.DesktopMenuDivider);
  const menuPadding = 4;
  const menuBorder = 2;
  const menuWidth = controller.menuWidth ?? defaultMenuWidth;
  const submenuWidth = controller.submenuWidth ?? defaultMenuWidth;
  const menuStyle = controller.getMenuStyle({
    menuItemHeight,
    menuWidth,
  });
  const submenuStyle =
    controller.activeIndex !== null && controller.activeMenu?.submenu && controller.isSubmenuOpen
      ? controller.getSubmenuStyle({
          menuItemHeight,
          menuWidth,
          submenuWidth,
        })
      : null;
  const menuHeight =
    controller.menuConfig.length * menuItemHeight +
    controller.menuConfig.filter((item) => item.dividerAbove).length * dividerHeight +
    menuPadding * 2 +
    menuBorder;
  const submenuItemCount = controller.activeMenu?.submenu
    ? controller.activeMenu.submenu.reduce((acc, group) => acc + group.length, 0)
    : 0;
  const submenuHeight =
    submenuItemCount * menuItemHeight +
    Math.max(0, (controller.activeMenu?.submenu?.length ?? 0) - 1) * dividerHeight +
    menuPadding * 2 +
    menuBorder;
  const wrapperLeft = submenuStyle
    ? Math.min(menuStyle.left as number, submenuStyle.left as number)
    : (menuStyle.left as number);
  const wrapperTop = submenuStyle
    ? Math.min(menuStyle.top as number, submenuStyle.top as number)
    : (menuStyle.top as number);
  const wrapperRight = Math.max(
    (menuStyle.left as number) + menuWidth,
    submenuStyle ? (submenuStyle.left as number) + submenuWidth : -Infinity
  );
  const wrapperBottom = Math.max(
    (menuStyle.top as number) + menuHeight,
    submenuStyle ? (submenuStyle.top as number) + submenuHeight : -Infinity
  );
  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    left: wrapperLeft,
    top: wrapperTop,
    width: wrapperRight - wrapperLeft,
    height: wrapperBottom - wrapperTop,
    zIndex: controller.zIndex,
  };
  const popupMenuStyle: React.CSSProperties = {
    ...menuStyle,
    position: 'absolute',
    left: (menuStyle.left as number) - wrapperLeft,
    top: (menuStyle.top as number) - wrapperTop,
  };
  const popupSubmenuStyle: React.CSSProperties | undefined = submenuStyle
    ? {
        ...submenuStyle,
        position: 'absolute',
        left: (submenuStyle.left as number) - wrapperLeft,
        top: (submenuStyle.top as number) - wrapperTop,
      }
    : undefined;

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
        data-test-id={TestIds.DesktopMenu.Backdrop}
      />

      <div style={popupStyle} data-test-id={TestIds.DesktopMenu.Popup}>
        <div
          ref={menuRef}
          className={desktopStyles.DesktopMenuContainer}
          style={popupMenuStyle}
          tabIndex={0}
          data-test-id={TestIds.DesktopMenu.Container}
        >
          <div className={desktopStyles.DesktopMenuContent}>
            {controller.menuConfig.map((item, index) => (
              <React.Fragment key={index}>
                {item.dividerAbove && <div className={desktopStyles.DesktopMenuDivider} />}
                <DesktopMenuItemComponent
                  item={item}
                  onItemClick={handleItemClick}
                  onMouseEnter={() => controller.setActiveIndex(index)}
                  isActive={controller.activeIndex === index}
                  showCheckmarks={controller.showCheckmarks}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
        {controller.activeIndex !== null &&
          controller.activeMenu?.submenu &&
          controller.isSubmenuOpen &&
          popupSubmenuStyle && (
            <DesktopSubmenuComponent
              submenu={controller.activeMenu.submenu}
              style={popupSubmenuStyle}
              onItemClick={handleItemClick}
              activeSubmenuIndex={controller.activeSubmenuIndex}
              onMouseEnter={(index) => controller.setActiveSubmenuIndex(index)}
              showCheckmarks={controller.showSubmenuCheckmarks}
            />
          )}
      </div>
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
