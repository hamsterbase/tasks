import classNames from 'classnames';
import React from 'react';
import { styles } from '../theme';

export type MobileButtonSize = 'small' | 'medium' | 'large';
export type MobileButtonShape = 'default' | 'light';

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: MobileButtonSize;
  shape?: MobileButtonShape;
  children: React.ReactNode;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  size = 'medium',
  shape = 'default',
  children,
  className = '',
  ...props
}) => {
  const buttonStyles = classNames(
    styles.baseButtonStyle,
    // Disabled styles
    { [styles.baseButtonDisabledStyle]: props.disabled },
    // Size styles
    {
      [styles.buttonSizeLargeStyle]: size === 'large',
    },
    // Shape/variant styles
    {
      [styles.buttonShapeDefaultStyle]: shape === 'default',
      [styles.buttonShapeLightStyle]: shape === 'light',
    }
  );

  return (
    <button className={`${buttonStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};
