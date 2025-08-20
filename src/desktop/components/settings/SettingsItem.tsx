import { desktopStyles } from '@/desktop/theme/main';
import React from 'react';
import { Select } from '../Form/Select/Select';
import { Switch } from '../Switch';
import { Button } from './Button/Button';

export type ActionType = 'select' | 'switch' | 'button';

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

export type Action = SelectAction | SwitchAction | ButtonAction;

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
          <Button onClick={action.onClick} disabled={action.disabled} variant="import" inline>
            {action.label}
          </Button>
        );
    }
  };

  return (
    <div className={desktopStyles.SettingsItemContainer}>
      <div className={desktopStyles.SettingsItemContentWrapper}>
        <h2 className={desktopStyles.SettingsItemTitle}>{title}</h2>
        {description && <p className={desktopStyles.SettingsItemDescription}>{description}</p>}
      </div>
      <div className={desktopStyles.SettingsItemActionWrapper}>{renderAction()}</div>
    </div>
  );
};
