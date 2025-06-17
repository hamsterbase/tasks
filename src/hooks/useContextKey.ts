import { useRef } from 'react';
import { ContextKeyValue, IContextKey, IContextKeyService, RawContextKey } from 'vscf/platform/contextkey/common';
import { useService } from './use-service';

export function useContextKey<T extends ContextKeyValue>(rawKey: RawContextKey<T>): IContextKey<T> {
  const contextKeyService = useService(IContextKeyService);
  const contentKeyRef = useRef<IContextKey<T> | null>(null);
  if (!contentKeyRef.current) {
    contentKeyRef.current = rawKey.bindTo(contextKeyService);
    return contentKeyRef.current as IContextKey<T>;
  }
  return contentKeyRef.current;
}
