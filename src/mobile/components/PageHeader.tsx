import { useCancelEdit } from '@/hooks/useCancelEdit';
import { useEdit } from '@/hooks/useEdit';
import classNames from 'classnames';
import TextArea from 'rc-textarea';
import React, { useRef } from 'react';
import { styles } from '../theme';
import { TaskDisplaySettingsIcon } from '@/components/icons';
export interface PageHeaderProps {
  title: string;
  headerPlaceholder?: string;
  id?: string;
  icon?: React.ReactNode;
  renderIcon?: (className: string) => React.ReactNode;
  actions?: React.ReactNode;
  onSave?: (title: string) => void;
  handleClickTaskDisplaySettings?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  id,
  icon,
  actions,
  onSave,
  renderIcon,
  headerPlaceholder,
  handleClickTaskDisplaySettings,
}) => {
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const { isEditing, itemClassName, shouldIgnoreClick } = useCancelEdit(headerContainerRef, id ?? '');
  const { textAreaProps } = useEdit({
    isEditing,
    title,
    onSave: onSave ?? (() => {}),
    singleLine: false,
  });
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
        <div className="flex items-center gap-2 flex-1">
          <div
            onClickCapture={(e) => {
              if (isEditing) {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
          >
            {icon}
            {renderIcon && renderIcon(styles.homeMenuIconStyle)}
          </div>
          {isEditing && id ? (
            <TextArea
              value={textAreaProps.value}
              onChange={textAreaProps.onChange}
              onBlur={textAreaProps.onBlur}
              ref={(textAreaRef) => {
                textAreaProps.ref.current = (textAreaRef?.nativeElement as HTMLInputElement) ?? null;
              }}
              autoSize={{ minRows: 1 }}
              className="text-lg font-medium text-t1 bg-transparent flex-1 break-all"
            />
          ) : (
            <h1
              className={classNames(
                'text-lg font-medium text-t1 break-all whitespace-pre-wrap',
                title ? 'text-t1' : 'text-t3'
              )}
            >
              {title || headerPlaceholder}
            </h1>
          )}
        </div>
        {actions}
        {handleClickTaskDisplaySettings && (
          <div className="flex items-center gap-2">
            <button onClick={handleClickTaskDisplaySettings} className="flex items-center rounded text-t1">
              <TaskDisplaySettingsIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
