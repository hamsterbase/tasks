import { useLayoutEffect } from 'react';
import { Event } from 'vscf/base/common/event';

export function useRegisterEvent<T>(
  event: Event<T> | null | undefined,
  listener: (e: T) => unknown,
  ...args: unknown[]
) {
  useLayoutEffect(() => {
    if (event) {
      const result = event(listener);
      return result.dispose;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, listener, ...args]);
}
