import classNames from 'classnames';
import React from 'react';
import { desktopStyles } from '@/desktop/theme/main';

export type ButtonVariant = 'solid' | 'filled' | 'default' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonColor = 'primary' | 'default' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;

  children: React.ReactNode;
  size?: ButtonSize;
  inline?: boolean;
}

export const SettingButton: React.FC<ButtonProps> = ({
  variant = 'default',
  children,
  color = 'default',
  className = '',
  inline = false,
  size = 'large',
  ...props
}) => {
  const getButtonStyles = (buttonVariant: ButtonVariant, buttonColor: ButtonColor) => {
    if (buttonVariant === 'solid') {
      switch (buttonColor) {
        case 'primary':
          return desktopStyles.SettingButtonSolidPrimary;
        case 'danger':
          return desktopStyles.SettingButtonSolidDanger;
        case 'default':
          return desktopStyles.SettingButtonSolidDefault;
      }
    }

    if (buttonVariant === 'filled') {
      switch (buttonColor) {
        case 'primary':
          return desktopStyles.SettingButtonFilledPrimary;
        case 'danger':
          return desktopStyles.SettingButtonFilledDanger;
        case 'default':
          return desktopStyles.SettingButtonFilledDefault;
      }
    }

    if (buttonVariant === 'default') {
      switch (buttonColor) {
        case 'primary':
          return desktopStyles.SettingButtonDefaultPrimary;
        case 'danger':
          return desktopStyles.SettingButtonDefaultDanger;
        case 'default':
          return desktopStyles.SettingButtonDefaultDefault;
      }
    }

    if (buttonVariant === 'text') {
      switch (buttonColor) {
        case 'primary':
          return desktopStyles.SettingButtonTextPrimary;
        case 'danger':
          return desktopStyles.SettingButtonTextDanger;
        case 'default':
          return desktopStyles.SettingButtonTextDefault;
      }
    }

    return '';
  };

  const buttonStyles = classNames(getButtonStyles(variant, color), {
    [desktopStyles.SettingButtonSizeLarge]: size === 'large',
    [desktopStyles.SettingButtonSizeMedium]: size === 'medium',
    [desktopStyles.SettingButtonSizeSmall]: size === 'small',
    [desktopStyles.SettingButtonFullWidth]: !inline,
    [desktopStyles.SettingButtonDisabled]: props.disabled,
  });

  return (
    <button className={`${desktopStyles.SettingButtonBase} ${buttonStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};
