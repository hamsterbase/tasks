import { ITodoService } from '@/services/todo/common/todoService';
import { RefObject, useCallback, useEffect } from 'react';
import { useService } from './use-service';
import { useWatchEvent } from './use-watch-event';
import styles from './useCancelEdit.module.css';

export const useCancelEdit = (elementRef: RefObject<HTMLElement>, itemId: string) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onEditingContentChange, (id) => {
    if (id === itemId) {
      return true;
    }
    return false;
  });

  const isEditing = todoService.editingContent?.id === itemId;
  const updateTaskItemSize = useCallback(() => {
    const pageContent = document.getElementById('page-content');
    const taskRect = elementRef.current?.getBoundingClientRect();
    const containerRect = pageContent?.getBoundingClientRect();

    if (taskRect && containerRect && isEditing) {
      const top2 = taskRect.top - containerRect.top;
      const bottom = containerRect.top + containerRect.height - taskRect.top - taskRect.height;
      document.documentElement.style.setProperty('--task-item-top', `${top2}px`);
      document.documentElement.style.setProperty('--task-item-bottom', `${bottom}px`);
      document.documentElement.style.setProperty('--task-item-left', `${-taskRect.left}px`);
    }
  }, [elementRef, isEditing]);

  useEffect(() => {
    if (!ResizeObserver || !isEditing) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      updateTaskItemSize();
    });
    if (elementRef.current) {
      resizeObserver.observe(elementRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef, isEditing, updateTaskItemSize]);

  function isOutside(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!e.currentTarget) {
      return true;
    }
    // 判断是否在 line 的范围内
    const lineRect = e.currentTarget.getBoundingClientRect();
    const clientY = e.clientY;
    if (clientY < lineRect.top) {
      return true;
    } else {
      if (clientY > lineRect.bottom) {
        return true;
      } else {
        return false;
      }
    }
  }

  function shouldIgnoreClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (isOutside(e)) {
      todoService.endEditingContent();
      return true;
    }
    if (isEditing) {
      return true;
    }
    return false;
  }

  return {
    isEditing,
    itemClassName: {
      [styles['task-item-container']]: isEditing,
    },
    shouldIgnoreClick,
    isOutside,
    endEditing: () => {
      todoService.endEditingContent();
    },
  };
};
