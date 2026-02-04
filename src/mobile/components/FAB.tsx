import classNames from 'classnames';
import React from 'react';
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

export interface FABProps {
  left?: MenuItemProps | 'back';
  right?: MenuItemProps;
  mid?: CreateIconProps;
}

export const FAB: React.FC<FABProps> = ({ mid }) => {
  const switchService = useService(ISwitchService);
  const hideFABWhenKeyboardShow = switchService.getLocalSwitch('hideFABWhenKeyboardShow');

  return (
    <div
      className={classNames('fixed right-5 bottom-6 safe-bottom')}
      style={{
        display: hideFABWhenKeyboardShow ? 'var(--fab-display, block)' : 'block',
      }}
    >
      {mid && (
        <CreateIcon
          onClick={() => {
            mid.onClick();
          }}
        />
      )}
      <CancelDropZone />
    </div>
  );
};
