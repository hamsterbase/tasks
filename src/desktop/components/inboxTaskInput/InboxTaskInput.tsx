import { useWorkbenchInstance } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useRegisterEvent } from '@/hooks/useRegisterEvent';
import { localize } from '@/nls';
import React, { useCallback } from 'react';
import { CreateTaskEvent, INBOX_TASK_INPUT_CONTROLLER_KEY, InboxTaskInputController } from './InboxTaskInputController';
import './commands';

interface InboxTaskInputProps {
  onCreateTask: (event: CreateTaskEvent) => void;
}

export const InboxTaskInput: React.FC<InboxTaskInputProps> = ({ onCreateTask }) => {
  const controller = useWorkbenchInstance<InboxTaskInputController>(
    INBOX_TASK_INPUT_CONTROLLER_KEY,
    InboxTaskInputController
  );

  useWatchEvent(controller.onInputValueChange);
  useRegisterEvent(controller.onCreateTask, onCreateTask);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      controller?.updateInputValue(e.target.value);
    },
    [controller]
  );

  const handleFocus = useCallback(() => {
    controller?.setFocus(true);
  }, [controller]);

  const handleBlur = useCallback(() => {
    controller?.setFocus(false);
  }, [controller]);

  return (
    <div className="mb-2">
      <input
        type="text"
        value={controller.inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={localize('addTask', 'Add task...')}
        className="w-full px-3 py-2 bg-bg2 rounded-md text-t1 placeholder-t3 focus:outline-none"
      />
    </div>
  );
};
