import { CheckIcon } from '@/components/icons';
import type { IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { desktopStyles } from '@/desktop/theme/main';
import classNames from 'classnames';
import React from 'react';

interface DesktopSubmenuComponentProps {
  submenu: IMenuConfig[][];
  style: React.CSSProperties;
  onItemClick: (item: IMenuConfig) => void;
  activeSubmenuIndex?: number | null;
  onMouseEnter?: (index: number) => void;
  showCheckmarks?: boolean;
}

export const DesktopSubmenuComponent: React.FC<DesktopSubmenuComponentProps> = ({
  submenu,
  style,
  onItemClick,
  activeSubmenuIndex,
  onMouseEnter,
  showCheckmarks = false,
}) => {
  let itemIndex = 0;

  return (
    <div className={desktopStyles.DesktopSubmenuContainer} style={style}>
      {submenu.map((group, groupIndex) => (
        <div key={groupIndex}>
          {groupIndex > 0 && <div className={desktopStyles.DesktopMenuDivider} />}
          {group.map((subItem, subIndex) => {
            const currentIndex = itemIndex;
            const isActive = activeSubmenuIndex === currentIndex;
            itemIndex++;
            return (
              <button
                key={subIndex}
                className={classNames(
                  desktopStyles.DesktopSubmenuItem,
                  subItem.disabled ? desktopStyles.DesktopMenuItemDisabled : desktopStyles.DesktopMenuItemEnabled,
                  isActive && desktopStyles.DesktopMenuItemActive
                )}
                onClickCapture={(e) => {
                  e.stopPropagation();
                  onItemClick(subItem);
                }}
                onMouseEnter={() => onMouseEnter?.(currentIndex)}
                disabled={subItem.disabled}
              >
                {showCheckmarks && (
                  <div className={desktopStyles.DesktopMenuItemCheckbox}>
                    {subItem.checked && <CheckIcon className={desktopStyles.DesktopMenuItemCheckIcon} />}
                  </div>
                )}
                <span className={desktopStyles.DesktopMenuItemLabel}>{subItem.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
