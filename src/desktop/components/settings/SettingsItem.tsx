import { desktopStyles } from '@/desktop/theme/main';
import React from 'react';
import { InputField } from '../Form/InputField/InputField';
import { Select } from '../Form/Select/Select';
import { Switch } from '../Switch';
import { SettingButton } from './Button/Button';

export type ActionType = 'select' | 'switch' | 'button' | 'input';

export interface SelectAction {
  type: 'select';
  options: Array<{ value: string; label: string }>;
  currentValue: string;
  onChange: (value: string) => void;
}

export interface SwitchAction {
  type: 'switch';
  currentValue: boolean;
  onChange: (value: boolean) => void;
}

export interface ButtonAction {
  type: 'button';
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface InputAction {
  type: 'input';
  inputType?: 'text' | 'password' | 'url';
  placeholder?: string;
  currentValue: string;
  onChange: (value: string) => void;
}

export type Action = SelectAction | SwitchAction | ButtonAction | InputAction;

export interface SettingsItemProps {
  title: string;
  description?: string;
  action: Action;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ title, description, action }) => {
  const renderAction = () => {
    switch (action.type) {
      case 'select':
        return <Select value={action.currentValue} onChange={action.onChange} options={action.options} />;
      case 'switch':
        return <Switch checked={action.currentValue} onChange={action.onChange} />;
      case 'button':
        return (
          <SettingButton onClick={action.onClick} disabled={action.disabled} inline size="medium">
            {action.label}
          </SettingButton>
        );
      case 'input':
        return (
          <InputField
            type={action.inputType}
            placeholder={action.placeholder}
            value={action.currentValue}
            onChange={(e) => action.onChange(e.target.value)}
            className="w-45 rounded-md border border-line-regular bg-transparent px-2 py-1 text-xs leading-4 text-t1 placeholder:text-t3 outline-none transition-colors hover:border-line-bold focus:border-brand"
          />
        );
    }
  };

  return (
    <div className={desktopStyles.SettingsItemContainer}>
      <div className={desktopStyles.SettingsItemContentWrapper}>
        <span className={desktopStyles.SettingsItemTitle}>{title}</span>
        {description && <span className={desktopStyles.SettingsItemDescription}>{description}</span>}
      </div>
      <div className={desktopStyles.SettingsItemActionWrapper}>{renderAction()}</div>
    </div>
  );
};
