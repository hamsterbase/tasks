import classNames from 'classnames';
import React from 'react';
import { desktopStyles } from '@/desktop/theme/main';
import { BackButton } from '../../BackButton/BackButton';

interface SettingsContentProps {
  title?: string;
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
        className={classNames(desktopStyles.SettingsContentInner, {
          [desktopStyles.SettingsContentInnerWithBack]: !!props.back,
          [desktopStyles.SettingsContentInnerWithoutBack]: !props.back,
        })}
      >
        {props.title && <h1 className={desktopStyles.SettingsContentPageTitle}>{props.title}</h1>}
        {props.children}
      </div>
    </div>
  );
};
