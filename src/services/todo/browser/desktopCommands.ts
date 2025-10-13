import { KeyCode, KeyMod } from 'vscf/internal/base/common/keyCodes';
import { ContextKeyExpr, InputFocusedContextKey } from 'vscf/platform/contextkey/common';
import { KeybindingsRegistry, KeybindingWeight } from 'vscf/platform/keybinding/common';
import { ITodoService } from '../common/todoService';

// Main List Commands
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'CreateTask',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.not(InputFocusedContextKey),
  primary: KeyCode.KeyN,
  handler: (acc) => {
    const currentList = acc.get(ITodoService);
    if (currentList) {
      currentList.fireTaskCommand({ type: 'createTask' });
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'CreateProject',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.not(InputFocusedContextKey),
  primary: KeyCode.KeyP,
  handler: (acc) => {
    const currentList = acc.get(ITodoService);
    if (currentList) {
      currentList.fireTaskCommand({ type: 'createProject' });
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'CreateHeader',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.not(InputFocusedContextKey),
  primary: KeyCode.KeyH,
  handler: (acc) => {
    const currentList = acc.get(ITodoService);
    if (currentList) {
      currentList.fireTaskCommand({ type: 'createHeader' });
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'SetStartDateToToday',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.not(InputFocusedContextKey),
  primary: KeyCode.KeyT,
  handler: (acc) => {
    const currentList = acc.get(ITodoService);
    if (currentList) {
      currentList.fireTaskCommand({ type: 'setStartDateToToday' });
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'undo',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.not(InputFocusedContextKey),
  primary: KeyCode.KeyZ | KeyMod.CtrlCmd,
  handler: (acc) => {
    const todoService = acc.get(ITodoService);
    todoService.undo();
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'redo',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.not(InputFocusedContextKey),
  primary: KeyCode.KeyZ | KeyMod.CtrlCmd | KeyMod.Shift,
  handler: (acc) => {
    const todoService = acc.get(ITodoService);
    todoService.redo();
  },
});
