import { EditableTextArea } from '@/components/edit/EditableTextArea';
import { localize } from '@/nls';
import { TextAreaRef } from 'rc-textarea';
import React, { ReactNode, useRef } from 'react';

export interface EntityHeaderAction {
  icon: React.ReactNode;
  handleClick: (e: React.MouseEvent) => void;
  title?: string;
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
}) => {
  const textAreaRef = useRef<TextAreaRef>(null);
  const handleSave = (value: string) => {
    onSave?.(value);
  };

  return (
    <div className="min-h-12 flex items-center justify-between px-4 border-b border-line-light bg-bg1">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {renderIcon()}
        {editable && inputKey && onSave ? (
          <EditableTextArea
            ref={textAreaRef}
            inputKey={inputKey}
            inputId={inputId}
            defaultValue={title}
            onSave={handleSave}
            placeholder={placeholder || localize('common.untitled', 'Untitled')}
            className="flex-1 text-lg font-medium text-t1 resize-none bg-transparent border-none outline-none px-0 py-0"
            autoSize={{ minRows: 1 }}
          />
        ) : (
          <h1 className={`text-lg font-medium text-t1 truncate`}>
            {title || placeholder || localize('common.untitled', 'Untitled')}
          </h1>
        )}
      </div>
      {actions.length > 0 && (
        <div className="flex items-center">
          {actions.map((action, index) => (
            <button
              key={index}
              className={
                action.className ||
                'flex items-center gap-1 px-3 py-1.5 text-sm text-t2 hover:text-t1 hover:bg-bg2 rounded-md transition-colors'
              }
              title={action.title}
              onClick={action.handleClick}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
