import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { KeyCode } from 'vscf/internal/base/common/keyCodes';
import { ContextKeyExpr } from 'vscf/platform/contextkey/common';
import { KeybindingsRegistry, KeybindingWeight } from 'vscf/platform/keybinding/common';
import { TagEditorOverlayController } from './TagEditorOverlayController';
import {
  TagEditorFocus,
  TagEditorHasSearchText,
  TagEditorHasSelectedTags,
  TagEditorHasSuggestions,
} from './contextKey';

// Navigate down
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'tagEditor.focusNext',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(TagEditorFocus, TagEditorHasSuggestions),
  primary: KeyCode.DownArrow,
  handler: (acc) => {
    const workbenchOverlayService = acc.get(IWorkbenchOverlayService);
    const controller: TagEditorOverlayController | null = workbenchOverlayService.getOverlay(
      OverlayEnum.desktopTagEditor
    );
    controller?.focusNext();
  },
});

// Navigate up
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'tagEditor.focusPrevious',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(TagEditorFocus, TagEditorHasSuggestions),
  primary: KeyCode.UpArrow,
  handler: (acc) => {
    const workbenchOverlayService = acc.get(IWorkbenchOverlayService);
    const controller: TagEditorOverlayController | null = workbenchOverlayService.getOverlay(
      OverlayEnum.desktopTagEditor
    );
    controller?.focusPrevious();
  },
});

// Create tag with Space (when search text exists)
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'tagEditor.createTagWithSpace',
  weight: KeybindingWeight.WorkbenchContrib + 6,
  when: ContextKeyExpr.and(TagEditorFocus, TagEditorHasSearchText),
  primary: KeyCode.Space,
  handler: (acc) => {
    const workbenchOverlayService = acc.get(IWorkbenchOverlayService);
    const controller: TagEditorOverlayController | null = workbenchOverlayService.getOverlay(
      OverlayEnum.desktopTagEditor
    );
    controller?.createTagFromSearch();
  },
});

// Toggle tag with Space (when no search text and has suggestions)
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'tagEditor.toggleTagWithSpace',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(TagEditorFocus, TagEditorHasSuggestions, ContextKeyExpr.not(TagEditorHasSearchText.key)),
  primary: KeyCode.Space,
  handler: (acc) => {
    const workbenchOverlayService = acc.get(IWorkbenchOverlayService);
    const controller: TagEditorOverlayController | null = workbenchOverlayService.getOverlay(
      OverlayEnum.desktopTagEditor
    );
    controller?.toggleFocusedTag();
  },
});

// Save with Enter
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'tagEditor.save',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(TagEditorFocus),
  primary: KeyCode.Enter,
  handler: (acc) => {
    const workbenchOverlayService = acc.get(IWorkbenchOverlayService);
    const controller: TagEditorOverlayController | null = workbenchOverlayService.getOverlay(
      OverlayEnum.desktopTagEditor
    );
    controller?.dispose();
  },
});

// Remove last tag with Backspace
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'tagEditor.removeLastTag',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(TagEditorFocus, TagEditorHasSelectedTags, ContextKeyExpr.not(TagEditorHasSearchText.key)),
  primary: KeyCode.Backspace,
  handler: (acc) => {
    const workbenchOverlayService = acc.get(IWorkbenchOverlayService);
    const controller: TagEditorOverlayController | null = workbenchOverlayService.getOverlay(
      OverlayEnum.desktopTagEditor
    );
    controller?.removeLastTag();
  },
});

// Cancel with Escape
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'tagEditor.cancel',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(TagEditorFocus),
  primary: KeyCode.Escape,
  handler: (acc) => {
    const workbenchOverlayService = acc.get(IWorkbenchOverlayService);
    const controller: TagEditorOverlayController | null = workbenchOverlayService.getOverlay(
      OverlayEnum.desktopTagEditor
    );
    controller?.cancel();
  },
});
