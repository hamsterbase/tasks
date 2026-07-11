import { IContextKeyService, InputFocusedContext } from '@hamsterbase/foundation/contextkey';
import { useEffect } from 'react';
import { trackFocus } from '@hamsterbase/foundation/dom';
import { Event } from '@hamsterbase/foundation/event';
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
