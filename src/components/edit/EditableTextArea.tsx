import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { IEditService } from '@/services/edit/common/editService';
import TextArea, { TextAreaRef } from 'rc-textarea';
import React, { forwardRef, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';

interface EditableTextAreaProps {
  inputKey: string;
  defaultValue: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  onSave: (value: string) => void;
  className?: string;
  autoSize?: { minRows: number };
  inputId?: string;
  enableEnterToSave?: boolean;
}

export const EditableTextArea = forwardRef<TextAreaRef, EditableTextAreaProps>(
  (
    {
      inputKey,
      defaultValue,
      onChange,
      onBlur,
      onKeyDown,
      placeholder,
      onSave,
      className,
      autoSize,
      inputId,
      enableEnterToSave = false,
    },
    ref
  ) => {
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

    const handleInternalKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (enableEnterToSave && e.key === 'Enter') {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;
            const newValue = value.substring(0, start) + '\n' + value.substring(end);
            flushSync(() => {
              editService.setInputValue(inputKey, newValue);
            });
            textarea.setSelectionRange(start + 1, start + 1);
            textarea.focus();
          } else {
            e.preventDefault();
            const currentValue = editService.getInputValue(inputKey, defaultValue);
            onSave(currentValue);
            e.currentTarget.blur();
          }
        }
        onKeyDown?.(e);
      },
      [enableEnterToSave, editService, inputKey, onSave, defaultValue, onKeyDown]
    );

    return (
      <TextArea
        ref={ref}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInternalKeyDown}
        className={className}
        autoSize={autoSize}
        placeholder={placeholder}
      />
    );
  }
);

EditableTextArea.displayName = 'EditableTextArea';
