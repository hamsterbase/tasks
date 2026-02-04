import classNames from 'classnames';
import React from 'react';
import { CancelDropZone } from './dnd/CancelDropZone.tsx';
import { CreateIcon } from './dnd/CreateIcon.tsx';
import { useService } from '@/hooks/use-service.ts';
import { ISwitchService } from '@/services/switchService/common/switchService.ts';

export interface FABProps {
  onClick?: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
  const switchService = useService(ISwitchService);
  const hideFABWhenKeyboardShow = switchService.getLocalSwitch('hideFABWhenKeyboardShow');

  return (
    <div
      className={classNames('fixed right-5 bottom-6 safe-bottom')}
      style={{
        display: hideFABWhenKeyboardShow ? 'var(--fab-display, block)' : 'block',
      }}
    >
      {onClick && <CreateIcon onClick={onClick} />}
      <CancelDropZone />
    </div>
  );
};
