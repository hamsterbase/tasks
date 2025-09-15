import { PlusIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { useWorkbenchInstance } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import React, { useCallback } from 'react';
import './commands';
import { INBOX_TASK_INPUT_CONTROLLER_KEY, InboxTaskInputController } from './InboxTaskInputController';

export const InboxTaskInput: React.FC = () => {
  const controller = useWorkbenchInstance<InboxTaskInputController>(
    INBOX_TASK_INPUT_CONTROLLER_KEY,
    InboxTaskInputController
  );

  useWatchEvent(controller.onInputValueChange);

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
    <div className={desktopStyles.InboxTaskInputWrapper}>
      <div className={desktopStyles.InboxTaskInputContainer}>
        <PlusIcon className={desktopStyles.InboxTaskInputIcon} />
        <input
          type="text"
          value={controller.inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={localize('addTask', 'Add Task')}
          className={desktopStyles.InboxTaskInputField}
        />
      </div>
    </div>
  );
};
