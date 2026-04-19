import React from 'react';
import { desktopStyles } from '@/desktop/theme/main';

interface InputFieldProps {
  type?: 'text' | 'password' | 'url';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ type = 'text', placeholder, value, onChange, className }) => {
  const baseClassName = desktopStyles.DefaultInputField;

  return (
    <input
      type={type}
      className={className || baseClassName}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};
