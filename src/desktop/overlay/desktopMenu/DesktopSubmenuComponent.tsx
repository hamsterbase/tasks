import { CheckIcon } from '@/components/icons';
import type { IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { desktopStyles } from '@/desktop/theme/main';
import { TestIds } from '@/testIds';
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

  const renderLeadingIcon = (checked?: boolean) => {
    return (
      <span className={desktopStyles.DesktopMenuItemIcon}>
        {checked ? <CheckIcon className={desktopStyles.DesktopMenuItemCheckIcon} strokeWidth={1.5} /> : null}
      </span>
    );
  };

  return (
    <div className={desktopStyles.DesktopSubmenuContainer} style={style} data-test-id={TestIds.DesktopMenu.Submenu}>
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
                {showCheckmarks ? renderLeadingIcon(subItem.checked) : null}
                <span className={desktopStyles.DesktopMenuItemLabel}>{subItem.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
