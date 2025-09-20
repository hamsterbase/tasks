import React from 'react';

interface InputFieldProps {
  type?: 'text' | 'password' | 'url';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ type = 'text', placeholder, value, onChange, className }) => {
  const baseClassName =
    'w-full px-3 py-3 h-13 border border-line-regular rounded-lg bg-bg1 text-t1 text-base font-normal leading-5 placeholder-t3 focus:outline-none focus:border-brand focus:pr-8';

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
