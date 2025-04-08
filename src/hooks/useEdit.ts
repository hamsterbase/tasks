import { handleFocusAndScroll } from '@/base/browser/commonFocusHandler';
import { useLayoutEffect, useRef, useState } from 'react';

interface UseEditProps {
  isEditing: boolean;
  title: string;
  onSave: (title: string) => void;
  singleLine?: boolean;
  disableAutoFocus?: boolean;
  onConfirm?: () => void;
}

export const useEdit = ({
  isEditing,
  title,
  onSave,
  singleLine = false,
  disableAutoFocus = false,
  onConfirm,
}: UseEditProps) => {
  const textareaRef = useRef<HTMLInputElement | null>(null);
  const [textContent, setTextContent] = useState(title);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setTextContent(e.target.value);
  }
  function handleBlur() {
    onSave(textContent);
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
      onConfirm?.();
    }
  }
  useLayoutEffect(() => {
    const focusAndSelect = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();

        const isFocused = document.activeElement === textareaRef.current;

        if (!isFocused) {
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
            }
          }, 50);
        }
      }
    };

    if (isEditing && !disableAutoFocus) {
      focusAndSelect();
    }
  }, [isEditing, disableAutoFocus]);

  return {
    textAreaProps: {
      ref: textareaRef,
      value: textContent,
      onChange: handleChange,
      onBlur: handleBlur,
      ...(singleLine ? { enterKeyHint: 'done' as const, onKeyDown: handleKeyDown } : {}),
      onFocus: handleFocusAndScroll,
    },
  };
};
