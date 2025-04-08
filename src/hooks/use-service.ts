import { useContext, useRef } from 'react';
import { ServiceIdentifier, SyncDescriptor } from 'vscf/platform/instantiation/common';
import { GlobalContext } from '../components/GlobalContext/GlobalContext';

export function useService<T>(id: ServiceIdentifier<T>): T {
  const ctx = useContext(GlobalContext)!;
  const workbenchLegalService = ctx.instantiationService.invokeFunction((o) => o.get(id));
  return workbenchLegalService;
}

export function useInstance<T>(id: SyncDescriptor<T>): T {
  const ctx = useContext(GlobalContext)!;
  const controllerRef = useRef<T>();
  if (!controllerRef.current) {
    controllerRef.current = ctx.instantiationService.createInstance(id);
  }
  return controllerRef.current as T;
}
