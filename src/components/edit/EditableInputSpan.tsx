import { getCaretIndexAtX } from '@/base/browser/getCaretIndexAtX';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { IEditService } from '@/services/edit/common/editService';
import classNames from 'classnames';
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

    const handleInputBlur = () => {
      onSave(inputValue);
      onBlur?.();
    };

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        editService.setInputValue(inputKey, e.target.value);
        onChange?.(e);
      },
      [onChange, editService, inputKey]
    );

    const handleClickX = (e: React.MouseEvent<HTMLSpanElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const position = getCaretIndexAtX(e.currentTarget, inputValue, e.clientX);
      onStartEdit?.(inputValue, position);
    };

    const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
      onStartEdit?.(e.currentTarget.value, e.currentTarget.selectionStart ?? 0);
    };

    return (
      <React.Fragment>
        <div
          className={classNames(className, {
            hidden: isFocused,
          })}
        >
          <span
            data-no-drag
            style={{
              userSelect: 'text',
            }}
            className={classNames(desktopStyles.TaskListItemTitleSpan, {
              [desktopStyles.TaskListItemTitleSpanPlaceHolder]: !inputValue,
            })}
            onMouseDownCapture={handleClickX}
          >
            {inputValue || placeholder}
          </span>
        </div>
        <input
          ref={ref}
          className={classNames(className, {
            hidden: !isFocused,
          })}
          value={inputValue}
          onChange={handleInputChange}
          onSelect={handleSelect}
          onBlur={handleInputBlur}
          placeholder={placeholder}
        />
      </React.Fragment>
    );
  }
);
