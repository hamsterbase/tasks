import React from 'react';
import { DeleteIcon } from '@/components/icons';
import classNames from 'classnames';
import { styles } from '@/mobile/theme';

export interface InfoItemProps {
  itemKey: string;
  icon: React.ReactNode;
  className?: string;
  content: React.ReactNode;
  show?: boolean;
  onClick?: () => void;
  onClear?: () => void;
  background?: string;
}

export const InfoItem = ({ itemKey, icon, content, onClick, onClear, className }: InfoItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
  };

  return (
    <div
      key={itemKey}
      className={classNames(
        'flex items-start justify-between',
        styles.infoItemGap,
        styles.infoItemPadding,
        styles.infoItemRound,
        styles.itemItemMinHeight,
        className
      )}
      onClick={handleClick}
    >
      <button
        className={classNames(
          'flex items-center justify-center mt-0.5',
          styles.infoItemIconColor,
          styles.infoItemIconSize
        )}
      >
        {icon}
      </button>
      <div className={classNames('flex-1 flex justify-start', styles.infoItemTextSize, styles.infoItemTextColor)}>
        {content}
      </div>
      {onClear && (
        <button
          className={classNames('flex items-center justify-end', styles.infoItemDeleteIconColor)}
          onClick={handleClear}
        >
          <DeleteIcon className={styles.infoItemDeleteIconSize} />
        </button>
      )}
    </div>
  );
};

export interface InfoItemGroupProps {
  items: InfoItemProps[];
  className?: string;
}

export const InfoItemGroup = ({ items, className }: InfoItemGroupProps) => {
  const displayItems = items.filter((item) => item.show !== false);
  if (displayItems.length === 0) {
    return null;
  }

  return (
    <div className={classNames('flex flex-col', styles.infoItemGroupGap, className)}>
      {displayItems.map((item) => (
        <InfoItem
          key={item.itemKey}
          itemKey={item.itemKey}
          icon={item.icon}
          content={item.content}
          className={item.className}
          show={item.show}
          onClick={item.onClick}
          onClear={item.onClear}
          background={item.background}
        />
      ))}
    </div>
  );
};

// Keep the old component for backward compatibility
export const TaskDetailItem = InfoItem;
