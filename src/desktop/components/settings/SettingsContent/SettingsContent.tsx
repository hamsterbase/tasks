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
      {props.back && (
        <div className={desktopStyles.SettingsContentBackButton}>
          <BackButton label={props.back.label} to={props.back.to} />
        </div>
      )}
      <div
        className={classNames('mx-auto flex w-full max-w-2xl flex-col px-8 pb-32', {
          'pt-6': !!props.back,
          'pt-10': !props.back,
        })}
      >
        {props.children}
      </div>
    </div>
  );
};
