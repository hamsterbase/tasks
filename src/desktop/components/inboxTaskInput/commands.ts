import { IWorkbenchInstanceService } from '@/services/instance/common/instanceService';
import { KeyCode } from '@hamsterbase/foundation/keybinding';
import { KeybindingsRegistry, KeybindingWeight } from '@hamsterbase/foundation/keybinding';
import { InboxTaskInputFocus } from './contextKey';
import { INBOX_TASK_INPUT_CONTROLLER_KEY, InboxTaskInputController } from './InboxTaskInputController';

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'InboxTaskInputCreateTask',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: InboxTaskInputFocus,
  primary: KeyCode.Enter,
  handler: (instance) => {
    const workbenchInstance = instance.get(IWorkbenchInstanceService);
    const controller = workbenchInstance.getInstance<InboxTaskInputController>(INBOX_TASK_INPUT_CONTROLLER_KEY);
    if (!controller) {
      return;
    }
    controller.createTask();
  },
});
