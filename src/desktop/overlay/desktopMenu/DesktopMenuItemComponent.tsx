import { CheckIcon, ChevronRightIcon, CopyIcon, PlusCircleIcon, TrashIcon } from '@/components/icons';
import type { IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { desktopStyles } from '@/desktop/theme/main';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import React, { useRef } from 'react';

interface DesktopMenuItemComponentProps {
  item: IMenuConfig;
  onItemClick: (item: IMenuConfig) => void;
  isActive?: boolean;
  onMouseEnter?: () => void;
  showCheckmarks?: boolean;
}

export const DesktopMenuItemComponent: React.FC<DesktopMenuItemComponentProps> = ({
  item,
  onItemClick,
  isActive,
  onMouseEnter,
  showCheckmarks = false,
}) => {
  const itemRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    onItemClick(item);
  };

  const renderIcon = () => {
    switch (item.icon) {
      case 'plus-circle':
        return <PlusCircleIcon className={desktopStyles.DesktopMenuItemIcon} />;
      case 'copy':
        return <CopyIcon className={desktopStyles.DesktopMenuItemIcon} />;
      case 'trash':
        return <TrashIcon className={desktopStyles.DesktopMenuItemIcon} />;
      default:
        return <span className={desktopStyles.DesktopMenuItemIconEmpty} />;
    }
  };

  return (
    <button
      ref={itemRef}
      className={classNames(
        desktopStyles.DesktopMenuItemBase,
        'justify-between',
        item.disabled ? desktopStyles.DesktopMenuItemDisabled : desktopStyles.DesktopMenuItemEnabled,
        isActive && desktopStyles.DesktopMenuItemActive,
        item.danger && desktopStyles.DesktopMenuItemDanger
      )}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      disabled={item.disabled}
      data-test-id={TestIds.DesktopMenu.Item}
      data-test-label={item.label}
    >
      <div className={desktopStyles.DesktopMenuItemContent}>
        {renderIcon()}
        {showCheckmarks && (
          <div className={desktopStyles.DesktopMenuItemCheckbox}>
            {item.checked && <CheckIcon className={desktopStyles.DesktopMenuItemCheckIcon} />}
          </div>
        )}
        <span className={desktopStyles.DesktopMenuItemLabel}>{item.label}</span>
      </div>
      {item.submenu && item.submenu.length > 0 && <ChevronRightIcon className={desktopStyles.DesktopMenuItemChevron} />}
    </button>
  );
};
