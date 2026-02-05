import { LeftIcon } from '@/components/icons';
import { useBack } from '@/hooks/useBack';
import { useCancelEdit } from '@/hooks/useCancelEdit';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { styles } from '../theme';

export interface HeaderAction {
  icon: React.ReactNode;
  onClick: () => void;
}

export interface PageHeaderProps {
  title?: string;
  headerPlaceholder?: string;
  id?: string;
  icon?: React.ReactNode;
  renderIcon?: (className: string) => React.ReactNode;
  actions?: HeaderAction[];
  showBack?: boolean;
  onSave?: (title: string) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, id, actions, showBack }) => {
  const back = useBack();
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const { itemClassName, shouldIgnoreClick } = useCancelEdit(headerContainerRef, id ?? '');

  const headerContainerStyle = classNames(styles.headerBackground, styles.headerRoot, itemClassName);

  return (
    <div
      className={headerContainerStyle}
      ref={headerContainerRef}
      onClick={shouldIgnoreClick}
      data-testid="page-header"
    >
      {showBack && (
        <div className={styles.headerLeftContainer}>
          <button onClick={back} className={styles.headerActionButton}>
            <LeftIcon className={styles.headerActionButtonIcon} />
          </button>
        </div>
      )}

      {title && <span className={styles.headerTitle}>{title}</span>}

      {actions && actions.length > 0 && (
        <div className={styles.headerRightContainer}>
          {actions.map((action, index) => (
            <button key={index} onClick={action.onClick} className={styles.headerActionButton}>
              <div className={styles.headerActionButtonIcon}>{action.icon}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
