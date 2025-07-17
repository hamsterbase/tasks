import React from 'react';
import { Switch } from '../Switch';

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
        return (
          <select
            value={action.currentValue}
            onChange={(e) => action.onChange(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-line-light rounded-md bg-bg1 text-t1 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          >
            {action.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'switch':
        return (
          <Switch
            checked={action.currentValue}
            onChange={action.onChange}
          />
        );
      case 'button':
        return (
          <button
            onClick={action.onClick}
            disabled={action.disabled}
            className="px-4 py-2 bg-accent rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            {action.label}
          </button>
        );
    }
  };

  return (
    <div className="flex items-start justify-between py-4">
      <div className="flex-1 pr-4">
        <h2 className="text-lg font-medium text-t1 mb-1">{title}</h2>
        {description && <p className="text-sm text-t2">{description}</p>}
      </div>
      <div className="flex-shrink-0">{renderAction()}</div>
    </div>
  );
};
