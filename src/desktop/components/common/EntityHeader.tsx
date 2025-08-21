import { EditableTextArea } from '@/components/edit/EditableTextArea';
import { TaskDisplaySettingsIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import { TextAreaRef } from 'rc-textarea';
import React, { ReactNode, useRef } from 'react';

export interface EntityHeaderAction {
  icon: React.ReactNode;
  handleClick: (e: React.MouseEvent) => void;
  title?: string;
  label?: string;
  className?: string;
}

interface EntityHeaderProps {
  renderIcon: () => ReactNode;
  title: string;
  actions?: EntityHeaderAction[];
  inputKey?: string;
  inputId?: string;
  onSave?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;

  internalActions?: {
    displaySettings?: {
      onOpen: (right: number, bottom: number) => void;
    };
  };
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({
  renderIcon,
  title,
  actions = [],
  inputKey,
  inputId,
  onSave,
  placeholder,
  editable = false,
  internalActions,
}) => {
  const textAreaRef = useRef<TextAreaRef>(null);
  const handleSave = (value: string) => {
    onSave?.(value);
  };

  const allActions = [...actions];
  if (internalActions?.displaySettings) {
    const handleOpenTaskDisplaySettings = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      internalActions.displaySettings!.onOpen(rect.right, rect.bottom + 4);
    };

    allActions.push({
      icon: <TaskDisplaySettingsIcon />,
      handleClick: handleOpenTaskDisplaySettings,
      label: localize('inbox.display', 'Display'),
      title: localize('inbox.taskDisplaySettings', 'Task Display Settings'),
    });
  }

  return (
    <div className={desktopStyles.EntityHeaderContainer}>
      <div className={desktopStyles.EntityHeaderContentWrapper}>
        <button className={desktopStyles.EntityHeaderIconButton}>{renderIcon()}</button>
        {editable && inputKey && onSave ? (
          <EditableTextArea
            ref={textAreaRef}
            inputKey={inputKey}
            inputId={inputId}
            defaultValue={title}
            onSave={handleSave}
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
          {allActions.map((action, index) => (
            <button
              key={index}
              className={action.className || desktopStyles.EntityHeaderActionButton}
              title={action.title}
              onClick={action.handleClick}
            >
              <span className={desktopStyles.EntityHeaderActionIcon}>{action.icon}</span>
              <span className={desktopStyles.EntityHeaderActionLabel}>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
