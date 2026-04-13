import { EditableTextArea } from '@/components/edit/EditableTextArea';
import { PanelLeftIcon, TaskDisplaySettingsIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import { TextAreaRef } from 'rc-textarea';
import classNames from 'classnames';
import React, { ReactNode, useRef } from 'react';

const ICON_STROKE_WIDTH = 1.5;

interface HeaderAction {
  icon: ReactNode;
  handleClick: (e: React.MouseEvent) => void;
  label: string;
  title: string;
  iconOnly?: boolean;
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
  extraActions?: HeaderAction[];

  internalActions?: {
    displaySettings?: {
      onOpen: (right: number, bottom: number) => void;
    };
  };
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
  extraActions,
  internalActions,
}) => {
  const textAreaRef = useRef<TextAreaRef>(null);
  const headerIcon = renderIcon();
  const headerIconNode = React.isValidElement<{ className?: string }>(headerIcon)
    ? React.cloneElement(headerIcon, {
        className: classNames(desktopStyles.EntityHeaderIconSvg, headerIcon.props.className),
      })
    : headerIcon;
  const handleSave = (value: string) => {
    onSave?.(value);
  };

  const allActions: HeaderAction[] = [];
  if (internalActions?.displaySettings) {
    const handleOpenTaskDisplaySettings = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      internalActions.displaySettings!.onOpen(rect.right, rect.bottom + 4);
    };

    allActions.push({
      icon: <TaskDisplaySettingsIcon strokeWidth={ICON_STROKE_WIDTH} />,
      handleClick: handleOpenTaskDisplaySettings,
      label: localize('inbox.display', 'Display'),
      title: localize('inbox.taskDisplaySettings', 'Task Display Settings'),
      iconOnly: true,
    });
  }

  if (extraActions && extraActions.length > 0) {
    allActions.push(...extraActions);
  }

  return (
    <div className={desktopStyles.EntityHeaderContainer}>
      <div className={desktopStyles.EntityHeaderContentWrapper}>
        <div className={desktopStyles.EntityHeaderPanelIconContainer} style={{ display: 'none' }}>
          <PanelLeftIcon className={desktopStyles.EntityHeaderPanelIcon} />
        </div>
        <div className={desktopStyles.EntityHeaderIconContainer}>
          <button className={desktopStyles.EntityHeaderIconButton} onClick={onIconClick}>
            {headerIconNode}
          </button>
        </div>
        {editable && inputKey && onSave ? (
          <EditableTextArea
            ref={textAreaRef}
            inputKey={inputKey}
            inputId={inputId}
            defaultValue={title}
            onSave={handleSave}
            enableEnterToSave
            placeholder={placeholder || localize('common.untitled', 'Untitled')}
            className={desktopStyles.EntityHeaderEditableTextArea}
            autoSize={{ minRows: 1 }}
          />
        ) : (
          <h1 className={desktopStyles.EntityHeaderTitle}>
            {title || placeholder || localize('common.untitled', 'Untitled')}
          </h1>
        )}
      </div>
      {allActions.length > 0 && (
        <div className={desktopStyles.EntityHeaderActionsContainer}>
          {allActions.map((action, index) =>
            (() => {
              const actionIcon = React.isValidElement<{ className?: string }>(action.icon)
                ? React.cloneElement(action.icon, {
                    className: classNames(
                      action.iconOnly
                        ? desktopStyles.EntityHeaderIconActionIcon
                        : desktopStyles.EntityHeaderActionIconSvg,
                      action.icon.props.className
                    ),
                  })
                : action.icon;

              return (
                <button
                  key={index}
                  className={
                    action.iconOnly
                      ? desktopStyles.EntityHeaderIconActionButton
                      : desktopStyles.EntityHeaderActionButton
                  }
                  title={action.title}
                  onClick={action.handleClick}
                >
                  <span className={desktopStyles.EntityHeaderActionIcon}>{actionIcon}</span>
                  {!action.iconOnly && <span className={desktopStyles.EntityHeaderActionLabel}>{action.label}</span>}
                </button>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
