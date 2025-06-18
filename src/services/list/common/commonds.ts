import { KeyCode } from 'vscf/internal/base/common/keyCodes';
import { ContextKeyExpr } from 'vscf/platform/contextkey/common';
import { KeybindingsRegistry, KeybindingWeight } from 'vscf/platform/keybinding/common';
import { IListService } from '@/services/list/common/listService';
import {
  MainListCursorHasNextItem,
  MainListCursorHasPreviousItem,
  MainListFocus,
  MainListIsInputValueEmpty,
} from './contextKey';

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'MainListSelectNext',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(MainListFocus, MainListCursorHasNextItem),
  primary: KeyCode.DownArrow,
  handler: (acc) => {
    const currentList = acc.get(IListService).mainList;
    if (currentList) {
      currentList.selectNext();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'MainListSelectPrevious',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(MainListFocus, MainListCursorHasPreviousItem),
  primary: KeyCode.UpArrow,
  handler: (acc) => {
    const currentList = acc.get(IListService).mainList;
    if (currentList) {
      currentList.selectPrevious();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'MainListSelectCreateNewOne',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(MainListFocus),
  primary: KeyCode.Enter,
  handler: (acc) => {
    const currentList = acc.get(IListService).mainList;
    if (currentList) {
      currentList.createNewOne();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'MainListSelectDeleteSelected',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(MainListFocus, MainListIsInputValueEmpty),
  primary: KeyCode.Backspace,
  handler: (acc) => {
    const currentList = acc.get(IListService).mainList;
    if (currentList) {
      currentList.deleteCurrentItem();
    }
  },
});
