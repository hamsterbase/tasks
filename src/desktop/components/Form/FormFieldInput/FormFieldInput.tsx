import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import React, { useState } from 'react';

interface FormFieldInputProps {
  label: string;
  required?: boolean;
  type?: 'text' | 'password' | 'url';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const FormFieldInput: React.FC<FormFieldInputProps> = ({
  label,
  required,
  type = 'text',
  value,
  onChange,
  placeholder,
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showSecret ? 'text' : type;

  return (
    <div className={desktopStyles.SettingsDialogField}>
      <label className={desktopStyles.SettingsDialogLabel}>
        {label}
        {required && <span className={desktopStyles.SettingsDialogRequired}>*</span>}
      </label>
      {isPassword ? (
        <div className={desktopStyles.FormFieldInputSecretWrapper}>
          <input
            type={inputType}
            value={value}
            onChange={onChange}
            className={desktopStyles.SettingsDialogInput}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => setShowSecret((s) => !s)}
            className={desktopStyles.FormFieldInputSecretToggle}
          >
            {showSecret ? localize('form.hide', 'Hide') : localize('form.show', 'Show')}
          </button>
        </div>
      ) : (
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          className={desktopStyles.SettingsDialogInput}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};
