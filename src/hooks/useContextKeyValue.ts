import { useEffect, useState } from 'react';
import { ContextKeyValue, IContextKeyService, RawContextKey } from 'vscf/platform/contextkey/common';
import { useService } from './use-service';

export function useContextKeyValue<T extends ContextKeyValue>(rawKey: RawContextKey<T>): T {
  const contextKeyService = useService(IContextKeyService);

  const [value, setValue] = useState<T>(contextKeyService.getContextKeyValue(rawKey.key) as T);

  useEffect(() => {
    const dispose = contextKeyService.onDidChangeContext(() => {
      setValue(contextKeyService.getContextKeyValue(rawKey.key) as T);
    });

    return () => {
      dispose.dispose();
    };
  }, [rawKey.key, contextKeyService]);

  return value;
}
