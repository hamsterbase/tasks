import { ButtonColor, ButtonSize, ButtonVariant } from './button';

export type DialogAction = DialogInputAction | DialogButtonAction;

export interface DialogInputAction {
  key: string;
  type: 'input';
  placeholder?: string;
  value?: string;
  inputType?: 'text' | 'url' | 'password';
  label?: string;
  required?: boolean;
  validation?: (value: string) => string | undefined;
}

export interface DialogButtonAction {
  key: string;
  type: 'button';
  label: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  color?: ButtonColor;
  onclick?: (actionValues: DialogActionValue) => void | Promise<void>;
}

export type DialogActionValue = Record<string, string | boolean>;
