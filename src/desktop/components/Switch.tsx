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
        className={`${desktopStyles.SwitchContainer} ${checked ? desktopStyles.SwitchContainerActive : desktopStyles.SwitchContainerInactive}`}
      >
        <div
          className={`${desktopStyles.SwitchKnob} ${
            checked ? desktopStyles.SwitchKnobActive : desktopStyles.SwitchKnobInactive
          }`}
        />
      </div>
    </label>
  );
};
