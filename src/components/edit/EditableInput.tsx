import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { IEditService } from '@/services/edit/common/editService';
import React, { forwardRef, useCallback, useEffect } from 'react';

interface EditableInputProps {
  inputKey: string;
  defaultValue: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onSelect?: (e: React.SyntheticEvent<HTMLInputElement>) => void;
  placeholder: string;
  onSave: (value: string) => void;
  className?: string;
}

export const EditableInput = forwardRef<HTMLInputElement, EditableInputProps>(
  ({ inputKey, defaultValue, onChange, onBlur, onSelect, placeholder, onSave, className }, ref) => {
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

    return (
      <input
        ref={ref}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onSelect={onSelect}
        className={className}
        placeholder={placeholder}
      />
    );
  }
);

EditableInput.displayName = 'EditableInput';
