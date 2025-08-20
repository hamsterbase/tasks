import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'import';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  inline?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  inline = false,
  ...props
}) => {
  const getButtonStyles = (buttonVariant: ButtonVariant) => {
    switch (buttonVariant) {
      case 'primary':
        return 'bg-brand text-white hover:bg-brand/90 focus:ring-brand';
      case 'secondary':
        return 'bg-bg3 text-t3 hover:bg-bg3/90 focus:ring-bg3';
      case 'danger':
        return 'bg-transparent text-stress-red border border-line-regular hover:bg-stress-red/10 focus:ring-stress-red';
      case 'import':
        return 'bg-transparent text-t1 border border-line-regular hover:bg-bg2 focus:ring-line-regular';
    }
  };

  const baseStyles =
    'py-3 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-base font-normal leading-5 h-13 flex flex-row justify-center items-center gap-3';
  const widthClass = inline ? 'min-w-20' : 'w-full';

  const buttonStyles = getButtonStyles(variant);

  return (
    <button className={`${widthClass} ${baseStyles} ${buttonStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};
