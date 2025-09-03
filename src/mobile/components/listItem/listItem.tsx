import { CheckIcon, ChevronRightIcon } from '@/components/icons';
import classNames from 'classnames';
import React from 'react';
import { Switch } from '../switch';

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
        className={classNames('flex flex-row items-center p-3 gap-5 relative w-full bg-bg1 isolation-isolate', {
          'justify-start': align === 'left',
          'justify-end': align === 'right',
          'justify-center': align === 'center',
        })}
        onClick={onClick}
      >
        <div
          className={classNames(`font-normal text-base`, {
            'text-stress-red': mode.theme === 'danger',
            'text-brand': mode.theme === 'primary',
          })}
        >
          {title}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className="flex flex-row justify-center items-center p-3 gap-5 relative w-full bg-bg1 isolation-isolate"
      onClick={onClick}
    >
      <div className="flex flex-row items-center flex-grow gap-2">
        {icon && <div className="size-6">{icon}</div>}
        <div className="flex flex-col gap-0.5">
          <div className="font-normal text-base text-t1 line-clamp-1">{title}</div>
          {description && <div className="font-normal text-xs text-t3 line-clamp-1">{description}</div>}
        </div>
      </div>
      <div className="flex items-center">
        {mode.type === 'navigation' && (
          <>
            {mode.label && <div className="text-xs text-right text-t3 mr-0.5 line-clamp-1">{mode.label}</div>}
            <ChevronRightIcon className="size-4 text-t3" />
          </>
        )}
        {mode.type === 'check' && (
          <div className="size-4">{mode.checked && <CheckIcon className="size-4 text-primary" />}</div>
        )}
        {mode.type === 'label' && <div className="text-xs text-right text-t3">{mode.label}</div>}
        {mode.type === 'switch' && <Switch checked={mode.checked} />}
      </div>
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

  return (
    <div className={classNames('flex flex-col w-full rounded-md overflow-hidden', className)}>
      {title && <div className="px-3 pt-2 pb-1 text-sm font-medium text-t3">{title}</div>}
      <div className="flex flex-col">
        {items
          .filter((item) => !item.hidden)
          .map((item, index) => (
            <React.Fragment key={index}>
              <div
                className={classNames('h-[1px] bg-line-light', {
                  hidden: index === 0,
                  'ml-3  w-[calc(100%-0.75rem)]': !item.icon && item.mode.type !== 'button',
                  'ml-11  w-[calc(100%-2.75rem)]': item.icon,
                })}
              />
              <ListItem key={index} {...item} />
            </React.Fragment>
          ))}
      </div>
      {subtitle && <div className="px-3 py-2 text-xs text-t3">{subtitle}</div>}
    </div>
  );
};
