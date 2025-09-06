import { getCaretIndexAtX } from '@/base/browser/getCaretIndexAtX';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { IEditService } from '@/services/edit/common/editService';
import React, { forwardRef, useCallback, useEffect } from 'react';

interface EditableInputProps {
  inputKey: string;
  defaultValue: string;
  isFocused: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onStartEdit?: (currentValue: string, cursor: number) => void;
  placeholder: string;
  onSave: (value: string) => void;
  className?: string;
}

export const EditableInputSpan = forwardRef<HTMLInputElement, EditableInputProps>(
  ({ inputKey, defaultValue, onChange, onBlur, placeholder, onSave, className, onStartEdit, isFocused }, ref) => {
    const editService = useService(IEditService);
    useWatchEvent(editService.onInputChange, (e) => {
      return e.inputKey === inputKey;
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
      (e: React.ChangeEvent<HTMLInputElement>) => {
        editService.setInputValue(inputKey, e.target.value);
        onChange?.(e);
      },
      [onChange, editService, inputKey]
    );

    const handleClickX = (e: React.MouseEvent<HTMLSpanElement>) => {
      const position = getCaretIndexAtX(e.currentTarget, inputValue, e.clientX);
      onStartEdit?.(inputValue, position);
    };

    const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
      onStartEdit?.(e.currentTarget.value, e.currentTarget.selectionStart ?? 0);
    };

    if (!isFocused) {
      return (
        <div className={className}>
          <span className={desktopStyles.TaskListItemTitleSpan} onClickCapture={handleClickX}>
            {inputValue}
          </span>
        </div>
      );
    }
    return (
      <input
        ref={ref}
        className={className}
        value={inputValue}
        onChange={handleInputChange}
        onSelect={handleSelect}
        onBlur={handleInputBlur}
        placeholder={placeholder}
      />
    );
  }
);
