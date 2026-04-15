import React from 'react';
import { desktopStyles } from '@/desktop/theme/main';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <label className={`${desktopStyles.SwitchLabel} ${disabled ? desktopStyles.SwitchLabelDisabled : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={desktopStyles.SwitchInput}
      />
      <div
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-bg3'}`}
      >
        <div
          className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-bg1 transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </div>
    </label>
  );
};
