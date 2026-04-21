import { TaskDisplaySettingsIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IEditService } from '@/services/edit/common/editService';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import TextArea, { TextAreaRef } from 'rc-textarea';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { IContextKeyService } from 'vscf/platform/contextkey/common';
import { EntityHeaderDetailFocus, EntityHeaderPageFocus } from './entityHeader.contextKey';

const ICON_STROKE_WIDTH = 1.5;

interface HeaderAction {
  icon: ReactNode;
  handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  testId?: string;
}

interface EntityHeaderProps {
  renderIcon: () => ReactNode;
  onIconClick?: () => void;
  title: string;
  inputKey?: string;
  inputId?: string;
  onSave?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  variant?: 'page' | 'detail';
  extraActions?: HeaderAction[];

  internalActions?: {
    displaySettings?: {
      onOpen: (right: number, bottom: number) => void;
    };
  };
}

function withIconClass(icon: ReactNode, className: string) {
  if (!React.isValidElement<{ className?: string }>(icon)) {
    return icon;
  }

  return React.cloneElement(icon, {
    className: classNames(className, icon.props.className),
  });
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({
  renderIcon,
  onIconClick,
  title,
  inputKey,
  inputId,
  onSave,
  placeholder,
  editable = false,
  variant = 'page',
  extraActions,
  internalActions,
}) => {
  const isDetail = variant === 'detail';
  const textAreaRef = useRef<TextAreaRef>(null);
  const editService = useService(IEditService);
  const contextKeyService = useService(IContextKeyService);
  const [entityHeaderFocusContext] = useState(() =>
    (isDetail ? EntityHeaderDetailFocus : EntityHeaderPageFocus).bindTo(contextKeyService)
  );
  const displaySettings = internalActions?.displaySettings;
  const headerIconNode = withIconClass(renderIcon(), desktopStyles.EntityHeaderIconSvg);
  const fallbackTitle = placeholder || localize('common.untitled', 'Untitled');
  const displayTitle = title || fallbackTitle;

  useWatchEvent(editService.onInputChange, (e) => {
    return e.inputKey === inputKey;
  });

  useWatchEvent(editService.onFocusInput, (e) => {
    if (inputId && e.inputId === inputId && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.resizableTextArea?.textArea?.select();
    }
    return inputId === e.inputId;
  });

  useEffect(() => {
    if (!inputKey) {
      return;
    }
    editService.setInputValue(inputKey, title);
  }, [editService, inputKey, title]);

  const handleTitleFocus = () => {
    entityHeaderFocusContext.set(true);
  };

  const handleTitleBlur = useCallback(() => {
    entityHeaderFocusContext.set(false);
  }, [entityHeaderFocusContext]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!inputKey) {
        return;
      }
      editService.setInputValue(inputKey, e.target.value);
    },
    [editService, inputKey]
  );

  const handleInputBlur = useCallback(() => {
    if (inputKey) {
      onSave?.(editService.getInputValue(inputKey, title));
    }
    handleTitleBlur();
  }, [editService, inputKey, onSave, title, handleTitleBlur]);

  const inputValue = inputKey ? editService.getInputValue(inputKey, title) : title;
  const allActions: HeaderAction[] = [
    ...(displaySettings
      ? [
          {
            icon: <TaskDisplaySettingsIcon strokeWidth={ICON_STROKE_WIDTH} />,
            handleClick: (e: React.MouseEvent<HTMLButtonElement>) => {
              const rect = e.currentTarget.getBoundingClientRect();
              displaySettings.onOpen(rect.right, rect.bottom + 4);
            },
            title: localize('inbox.taskDisplaySettings', 'Task Display Settings'),
            testId: TestIds.EntityHeader.DisplaySettingsButton,
          },
        ]
      : []),
    ...(extraActions ?? []),
  ];

  return (
    <div
      className={classNames(desktopStyles.EntityHeaderContainer, isDetail && desktopStyles.EntityHeaderContainerDetail)}
    >
      <div className={classNames(desktopStyles.EntityHeaderContentWrapper)}>
        <div className={desktopStyles.EntityHeaderIconContainer}>
          {onIconClick ? (
            <button type="button" className={desktopStyles.EntityHeaderIconButton} onClick={onIconClick}>
              {headerIconNode}
            </button>
          ) : (
            <div className={desktopStyles.EntityHeaderIconButton}>{headerIconNode}</div>
          )}
        </div>
        {editable && inputKey && onSave ? (
          <TextArea
            ref={textAreaRef}
            value={inputValue}
            onChange={handleTitleChange}
            onFocus={handleTitleFocus}
            onBlur={handleInputBlur}
            autoSize={{ minRows: 1 }}
            placeholder={fallbackTitle}
            className={desktopStyles.EntityHeaderEditableTextArea}
          />
        ) : (
          <h1 className={desktopStyles.EntityHeaderTitle}>{displayTitle}</h1>
        )}
      </div>
      {allActions.length > 0 && (
        <div className={desktopStyles.EntityHeaderActionsContainer}>
          {allActions.map((action, index) => (
            <button
              type="button"
              key={index}
              className={desktopStyles.EntityHeaderIconActionButton}
              title={action.title}
              onClick={action.handleClick}
              data-test-id={action.testId}
            >
              <span className={desktopStyles.EntityHeaderActionIcon}>
                {withIconClass(action.icon, desktopStyles.EntityHeaderActionIconSvg)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
