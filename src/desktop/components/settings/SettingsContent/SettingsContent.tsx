import classNames from 'classnames';
import React from 'react';
import { desktopStyles } from '@/desktop/theme/main';
import { BackButton } from '../../BackButton/BackButton';

interface SettingsContentProps {
  back?: {
    label: string;
    to: string;
  };
  children: React.ReactNode;
}

export const SettingsContent: React.FC<SettingsContentProps> = (props) => {
  return (
    <div className={desktopStyles.SettingsContentContainer}>
      <div className={desktopStyles.SettingsContentBackButton}>
        {props.back && <BackButton label={props.back.label} to={props.back.to} />}
      </div>
      <div
        className={classNames('flex-1 w-full max-w-160 overflow-y-scroll m-auto', {
          'py-6': !!props.back,
          'py-18': !props.back,
        })}
      >
        {props.children}
      </div>
    </div>
  );
};
