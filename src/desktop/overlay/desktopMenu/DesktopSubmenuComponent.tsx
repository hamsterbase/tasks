import { CheckIcon } from '@/components/icons';
import type { IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
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
    <div className="fixed bg-bg1 border border-line-light rounded-lg shadow-lg py-1" style={style}>
      {submenu.map((group, groupIndex) => (
        <div key={groupIndex}>
          {groupIndex > 0 && <div className="border-t border-line-light my-1" />}
          {group.map((subItem, subIndex) => {
            const currentIndex = itemIndex;
            const isActive = activeSubmenuIndex === currentIndex;
            itemIndex++;
            return (
              <button
                key={subIndex}
                className={classNames(
                  'w-full flex items-center gap-2 py-2 px-3 text-left text-sm transition-colors',
                  subItem.disabled ? 'text-t3 cursor-not-allowed' : 'text-t1 hover:bg-bg2',
                  isActive && 'bg-bg2'
                )}
                onClickCapture={(e) => {
                  e.stopPropagation();
                  onItemClick(subItem);
                }}
                onMouseEnter={() => onMouseEnter?.(currentIndex)}
                disabled={subItem.disabled}
              >
                {showCheckmarks && (
                  <div className="w-4 h-4 flex items-center justify-center">
                    {subItem.checked && <CheckIcon className="w-3 h-3 text-t1" />}
                  </div>
                )}
                <span className="flex-1">{subItem.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
