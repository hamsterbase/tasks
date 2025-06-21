import { CheckIcon, ChevronRightIcon } from '@/components/icons';
import type { IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
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

  return (
    <button
      ref={itemRef}
      className={classNames(
        'w-full flex items-center justify-between py-2 px-3 text-left text-sm transition-colors',
        item.disabled ? 'text-t3 cursor-not-allowed' : 'text-t1 hover:bg-bg2',
        isActive && 'bg-bg2'
      )}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      disabled={item.disabled}
    >
      <div className="flex items-center gap-2 flex-1">
        {showCheckmarks && (
          <div className="w-4 h-4 flex items-center justify-center">
            {item.checked && <CheckIcon className="w-3 h-3 text-t1" />}
          </div>
        )}
        <span className="flex-1">{item.label}</span>
      </div>
      {item.submenu && item.submenu.length > 0 && <ChevronRightIcon className="w-4 h-4 text-t3" />}
    </button>
  );
};
