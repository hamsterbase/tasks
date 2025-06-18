import { IContextKeyService, InputFocusedContext } from 'vscf/platform/contextkey/common';
import { useEffect } from 'react';
import { trackFocus } from 'vscf/base/browser/dom';
import { Event } from 'vscf/base/common/event';
import { useService } from '../use-service';

export const useInputFocused = () => {
  const contextKeyService = useService(IContextKeyService);
  useEffect(() => {
    function handleFocusChange() {
      const inputFocusedContext = InputFocusedContext.bindTo(contextKeyService);
      function activeElementIsInput(): boolean {
        return (
          !!document.activeElement &&
          (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')
        );
      }
      const isInputFocused = activeElementIsInput();
      inputFocusedContext.set(isInputFocused);
      if (isInputFocused) {
        const tracker = trackFocus(document.activeElement as HTMLElement);
        Event.once(tracker.onDidBlur)(() => {
          inputFocusedContext.set(activeElementIsInput());
          tracker.dispose();
        });
      }
    }
    document.addEventListener('focusin', handleFocusChange, true);
    return () => {
      document.removeEventListener('focusin', handleFocusChange);
    };
  }, [contextKeyService]);
};
