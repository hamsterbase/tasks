import { CheckIcon, ChevronRightIcon } from '@/components/icons';
import classNames from 'classnames';
import React from 'react';
import { Switch } from '../switch';
import { baseStyles } from '@/mobile/theme/base';

export interface ListItemOption {
  testId?: string;
  icon?: React.ReactNode;
  hidden?: boolean;
  title: string;
  description?: string;
  mode:
    | {
        // 右边是一个箭头
        type: 'navigation';
        // 箭头左边的文字
        label?: string;
      }
    | {
        type: 'label';
        label: string;
      }
    | {
        type: 'check';
        // 勾选框
        checked: boolean;
      }
    | {
        type: 'button';
        theme: 'primary' | 'danger';
        align?: 'left' | 'right' | 'center';
      }
    | {
        type: 'switch';
        checked: boolean;
      }
    | {
        type: 'plain';
      };
  onClick?: () => void;
}

interface ListItemProps extends ListItemOption {
  key?: React.Key;
}

const ListItem: React.FC<ListItemProps> = (props) => {
  const { icon, title, description, mode, onClick, testId } = props;

  if (mode.type === 'button') {
    const align = mode.align || 'center';
    return (
      <div
        data-testid={testId}
        className={classNames(baseStyles.settingsListItemButtonRoot, {
          [baseStyles.settingsListItemButtonAlignLeft]: align === 'left',
          [baseStyles.settingsListItemButtonAlignRight]: align === 'right',
          [baseStyles.settingsListItemButtonAlignCenter]: align === 'center',
        })}
        onClick={onClick}
      >
        <span
          className={classNames(baseStyles.settingsListItemButtonText, {
            [baseStyles.settingsListItemButtonTextDanger]: mode.theme === 'danger',
            [baseStyles.settingsListItemButtonTextPrimary]: mode.theme === 'primary',
          })}
        >
          {title}
        </span>
      </div>
    );
  }

  return (
    <div data-testid={testId} className={baseStyles.settingsListItemRoot} onClick={onClick}>
      {icon && <div className={baseStyles.settingsListItemIconContainer}>{icon}</div>}
      <div className={baseStyles.settingsListItemContent}>
        <span className={classNames(baseStyles.settingsListItemTitle, baseStyles.settingsListItemTitleNormal)}>
          {title}
        </span>
        {description && <span className={baseStyles.settingsListItemDescription}>{description}</span>}
      </div>
      {mode.type === 'navigation' && (
        <div className={baseStyles.settingsListItemNavContainer}>
          {mode.label && <span className={baseStyles.settingsListItemNavLabel}>{mode.label}</span>}
          <ChevronRightIcon className={baseStyles.settingsListItemNavIcon} />
        </div>
      )}
      {mode.type === 'check' && (
        <div className={baseStyles.settingsListItemCheckContainer}>
          {mode.checked && (
            <CheckIcon
              className={classNames(baseStyles.settingsListItemCheckIconSize, baseStyles.settingsListItemCheckIcon)}
            />
          )}
        </div>
      )}
      {mode.type === 'label' && <span className={baseStyles.settingsListItemLabelText}>{mode.label}</span>}
      {mode.type === 'switch' && <Switch checked={mode.checked} />}
    </div>
  );
};

export interface ListItemGroupProps {
  className?: string;
  title?: string;
  items: ListItemOption[];
  subtitle?: string;
}

export const ListItemGroup: React.FC<ListItemGroupProps> = (props) => {
  const { title, items, subtitle, className } = props;
  const visibleItems = items.filter((item) => !item.hidden);

  return (
    <div className={classNames(baseStyles.settingsListGroupRoot, className)}>
      {title && <span className={baseStyles.settingsListGroupTitle}>{title}</span>}
      <div className={baseStyles.settingsListGroupContainer}>
        {visibleItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <div className={baseStyles.settingsListGroupDivider} />}
            <ListItem {...item} />
          </React.Fragment>
        ))}
      </div>
      {subtitle && <span className={baseStyles.settingsListGroupSubtitle}>{subtitle}</span>}
    </div>
  );
};
