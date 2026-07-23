import { handleFocusAndScroll } from '@/base/browser/commonFocusHandler';
import { useLayoutEffect, useRef, useState } from 'react';

interface UseEditProps {
  isEditing: boolean;
  title: string;
  onSave: (title: string) => void;
  singleLine?: boolean;
  disableAutoFocus?: boolean;
  onConfirm?: () => void;
  enterKeyHint?: React.HTMLAttributes<HTMLInputElement>['enterKeyHint'];
}

export const useEdit = ({
  isEditing,
  title,
  onSave,
  singleLine = false,
  disableAutoFocus = false,
  onConfirm,
  enterKeyHint = 'done',
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
      }
    };

    if (isEditing && !disableAutoFocus) {
      // 聚焦必须等 dnd 的 drop 处理结束后再做：拖拽创建时若在同一任务内立即
      // focus()，输入框会进入"已聚焦但未激活"状态（无光标、不接收按键），
      // 且无法靠再次 focus() 修复。延后一帧以上即可。
      const focusTimer = window.setTimeout(focusAndSelect, 50);
      // dnd-kit 在 drop 后可能异步把焦点还给拖拽激活元素；复检并夺回。
      const recheckTimer = window.setTimeout(() => {
        if (textareaRef.current && document.activeElement !== textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 180);
      return () => {
        window.clearTimeout(focusTimer);
        window.clearTimeout(recheckTimer);
      };
    }
  }, [isEditing, disableAutoFocus]);

  return {
    textAreaProps: {
      ref: textareaRef,
      value: textContent,
      onChange: handleChange,
      onBlur: handleBlur,
      ...(singleLine ? { enterKeyHint, onKeyDown: handleKeyDown } : {}),
      onFocus: handleFocusAndScroll,
    },
  };
};
