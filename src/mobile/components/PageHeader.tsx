import { LeftIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { useBack } from '@/hooks/useBack';
import { useCancelEdit } from '@/hooks/useCancelEdit';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { styles } from '../theme';
export interface PageHeaderProps {
  title?: string;
  headerPlaceholder?: string;
  id?: string;
  icon?: React.ReactNode;
  renderIcon?: (className: string) => React.ReactNode;
  actions?: React.ReactNode;
  showBack?: boolean;
  onSave?: (title: string) => void;
  handleClickTaskDisplaySettings?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  id,
  actions,
  showBack,
  handleClickTaskDisplaySettings,
}) => {
  const back = useBack();
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const { itemClassName, shouldIgnoreClick } = useCancelEdit(headerContainerRef, id ?? '');

  const headerContainerStyle = classNames(
    styles.headerBackground,
    styles.headerPadding,
    'w-full h-auto box-border',
    itemClassName
  );
  return (
    <div
      className={headerContainerStyle}
      ref={headerContainerRef}
      onClick={shouldIgnoreClick}
      data-testid="page-header"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={back} className="flex items-center rounded text-t1">
              <LeftIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-center h-7">
          <h1 className={classNames('text-lg font-medium text-t1 break-all whitespace-pre-wrap')}>{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {handleClickTaskDisplaySettings && (
            <button onClick={handleClickTaskDisplaySettings} className="flex items-center rounded text-t1">
              <TaskDisplaySettingsIcon className="w-5 h-5" />
            </button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
};
