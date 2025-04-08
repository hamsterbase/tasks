import { BackIcon } from '@/components/icons/index.ts';
import { useBack } from '@/hooks/useBack.ts';
import classNames from 'classnames';
import React from 'react';
import { styles } from '../theme.ts';
import { CancelDropZone } from './dnd/CancelDropZone.tsx';
import { CreateIcon } from './dnd/CreateIcon.tsx';
import { useService } from '@/hooks/use-service.ts';
import { ISwitchService } from '@/services/switchService/common/switchService.ts';

type MenuItemStatus = 'normal' | 'active' | 'inactive';

interface MenuItemProps {
  icon: React.ReactNode;
  status: MenuItemStatus;
  onClick?: () => void;
}

interface CreateIconProps {
  onClick: () => void;
}

export interface BottomMenuProps {
  left?: MenuItemProps | 'back';
  right?: MenuItemProps;
  mid?: CreateIconProps;
}

interface MenuItemInnterProps {
  item?: MenuItemProps | 'back';
  onItemClick: () => void;
}

// MenuItem component for left and right buttons
const MenuItem: React.FC<MenuItemInnterProps> = ({ item, onItemClick }) => {
  const getButtonClass = (status: MenuItemStatus) => {
    return classNames('transition-colors', {
      [styles.bottomMenuTextNormal]: status === 'normal',
      [styles.bottomMenuTextActive]: status === 'active',
      [styles.bottomMenuTextInactive]: status === 'inactive',
    });
  };

  if (!item) {
    return null;
  }

  return (
    <button
      className={classNames(getButtonClass(item === 'back' ? 'normal' : item.status))}
      onClick={(e) => {
        e.stopPropagation();
        onItemClick();
      }}
    >
      {item === 'back' ? <BackIcon /> : item.icon}
    </button>
  );
};

export const BottomMenu: React.FC<BottomMenuProps> = ({ left, right, mid }) => {
  const switchService = useService(ISwitchService);
  const hideBottomMenuWhenKeyboardShow = switchService.getLocalSwitch('hideBottomMenuWhenKeyboardShow');

  const back = useBack();

  const handleLeftClick = () => {
    if (left === 'back') {
      back();
    } else {
      left?.onClick?.();
    }
  };

  const handleRightClick = () => {
    right?.onClick?.();
  };

  const commonSectionClass = classNames(
    styles.headerFooterPadding,
    styles.bottomMenuItemHeight,
    'flex-1 flex items-center'
  );

  return (
    <div
      className={classNames('fixed bottom-0 left-0 right-0 safe-bottom', {
        [styles.bottomMenuBackground]: true,
      })}
      style={{
        display: hideBottomMenuWhenKeyboardShow ? 'var(--bottom-menu-display, block)' : 'block',
      }}
    >
      <div className={classNames(styles.bottomMenuBorder, 'flex items-center justify-between')}>
        <div className={classNames(commonSectionClass, 'justify-start')} onClick={handleLeftClick}>
          <MenuItem item={left} onItemClick={handleLeftClick} />
        </div>
        <div className={classNames(commonSectionClass, 'justify-center')}>
          {mid && (
            <CreateIcon
              onClick={() => {
                mid.onClick();
              }}
            />
          )}
          <CancelDropZone />
        </div>
        <div className={classNames(commonSectionClass, 'justify-end')} onClick={handleRightClick}>
          <MenuItem item={right} onItemClick={handleRightClick} />
        </div>
      </div>
    </div>
  );
};
