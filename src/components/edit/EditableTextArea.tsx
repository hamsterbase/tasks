import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { IEditService } from '@/services/edit/common/editService';
import TextArea, { TextAreaRef } from 'rc-textarea';
import React, { forwardRef, useCallback, useEffect } from 'react';

interface EditableTextAreaProps {
  inputKey: string;
  defaultValue: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  placeholder: string;
  onSave: (value: string) => void;
  className?: string;
  autoSize?: { minRows: number };
  inputId?: string;
}

export const EditableTextArea = forwardRef<TextAreaRef, EditableTextAreaProps>(
  ({ inputKey, defaultValue, onChange, onBlur, placeholder, onSave, className, autoSize, inputId }, ref) => {
    const editService = useService(IEditService);
    useWatchEvent(editService.onInputChange, (e) => {
      return e.inputKey === inputKey;
    });

    useWatchEvent(editService.onFocusInput, (e) => {
      if (inputId && e.inputId === inputId && ref && 'current' in ref && ref.current) {
        ref.current.focus();
        ref.current.resizableTextArea?.textArea?.select();
      }
      return inputId === e.inputId;
    });

    useEffect(() => {
      editService.setInputValue(inputKey, defaultValue);
    }, [defaultValue, editService, inputKey]);

    const inputValue = editService.getInputValue(inputKey, defaultValue);

    const handleInputBlur = useCallback(() => {
      onSave(inputValue);
      onBlur?.();
    }, [onSave, onBlur, inputValue]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        editService.setInputValue(inputKey, e.target.value);
        onChange?.(e);
      },
      [onChange, editService, inputKey]
    );

    return (
      <TextArea
        ref={ref}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className={className}
        autoSize={autoSize}
        placeholder={placeholder}
      />
    );
  }
);

EditableTextArea.displayName = 'EditableTextArea';
