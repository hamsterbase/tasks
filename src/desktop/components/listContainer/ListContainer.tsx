import { ITaskList } from '@/components/taskList/type.ts';
import { useService } from '@/hooks/use-service';
import { IListService } from '@/services/list/common/listService';
import React, { useCallback, useLayoutEffect, useRef } from 'react';

interface ListContainerProps {
  children: React.ReactNode;
  className?: string;
  dependencies?: React.DependencyList;
  taskList?: ITaskList | null;
}

export const ListContainer: React.FC<ListContainerProps> = ({ children, className, taskList }) => {
  const listService = useService(IListService);
  const divRef = useRef<HTMLDivElement>(null);

  const setFocus = useCallback(() => {
    taskList?.setFocus(true);
  }, [taskList]);

  const clearFocus = useCallback(() => {
    taskList?.setFocus(false);
  }, [taskList]);

  useLayoutEffect(() => {
    const currentDiv = divRef.current;
    const activeElement = document.activeElement;

    if (currentDiv && activeElement && !currentDiv.contains(activeElement)) {
      const wasFocused = listService.mainList?.isFocused;
      if (wasFocused) {
        listService.mainList?.setFocus(false);
      }
    }
  });

  return (
    <div ref={divRef} tabIndex={1} onFocus={setFocus} onBlur={clearFocus} className={className}>
      {children}
    </div>
  );
};
