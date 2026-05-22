import { Switch } from '@/desktop/components/Switch';
import { desktopStyles } from '@/desktop/theme/main';
import React from 'react';

interface FormFieldSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const FormFieldSwitch: React.FC<FormFieldSwitchProps> = ({ label, description, checked, onChange }) => {
  return (
    <div className={desktopStyles.FormFieldSwitchRow}>
      <div className={desktopStyles.FormFieldSwitchContent}>
        <span className={desktopStyles.FormFieldSwitchLabel}>{label}</span>
        {description && <span className={desktopStyles.FormFieldSwitchDescription}>{description}</span>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
};
