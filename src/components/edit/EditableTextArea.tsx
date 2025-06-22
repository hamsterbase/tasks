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
}

export const EditableTextArea = forwardRef<TextAreaRef, EditableTextAreaProps>(
  ({ inputKey, defaultValue, onChange, onBlur, placeholder, onSave, className, autoSize }, ref) => {
    const editService = useService(IEditService);
    useWatchEvent(editService.onInputChange, (e) => {
      return e.inputKey === inputKey;
    });
    useEffect(() => {
      editService.setInputValue(inputKey, defaultValue);
    }, [defaultValue, editService, inputKey]);

    const inputValue = editService.getInputValue(inputKey);

    const handleInputBlur = useCallback(() => {
      onSave(editService.getInputValue(inputKey));
      onBlur?.();
    }, [onSave, onBlur, inputKey, editService]);

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
