import { useLayoutEffect } from 'react';
import { Event } from 'vscf/base/common/event';
import { useRender } from './use-render';

export function useWatchEvent<T = unknown>(event: Event<T> | undefined, shouldRender?: (e: T) => boolean) {
  const render = useRender();
  useLayoutEffect(() => {
    if (event) {
      return event((eventValue) => {
        if (shouldRender) {
          if (shouldRender(eventValue)) {
            render();
          }
        } else {
          render();
        }
      }).dispose;
    }
  }, [event, render, shouldRender]);
}
