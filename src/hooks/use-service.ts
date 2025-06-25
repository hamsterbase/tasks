import { IWorkbenchInstance, IWorkbenchInstanceService } from '@/services/instance/common/instanceService';
import { useContext, useEffect, useRef } from 'react';
import { IInstantiationService, ServiceIdentifier } from 'vscf/platform/instantiation/common';
import { GlobalContext } from '../components/GlobalContext/GlobalContext';

export function useService<T>(id: ServiceIdentifier<T>): T {
  const ctx = useContext(GlobalContext)!;
  const workbenchLegalService = ctx.instantiationService.invokeFunction((o) => o.get(id));
  return workbenchLegalService;
}

export const useWorkbenchInstance = <T extends IWorkbenchInstance>(key: string, creator: unknown): T => {
  const instanceService = useService(IWorkbenchInstanceService);
  const instantiationService = useService(IInstantiationService);

  const keyRef = useRef<string>(key);
  if (keyRef.current !== key) {
    throw new Error(
      `useWorkbenchInstance: key should not change during component lifecycle. Initial key: "${keyRef.current}", current key: "${key}"`
    );
  }

  const instantiationServiceRef = useRef<IInstantiationService>(instantiationService);
  if (instantiationServiceRef.current !== instantiationService) {
    throw new Error(`useWorkbenchInstance: instantiationService should not change during component lifecycle.`);
  }

  const creatorRef = useRef<unknown>(creator);
  if (creatorRef.current !== creator) {
    throw new Error(`useWorkbenchInstance: creator should not change during component lifecycle.`);
  }

  useEffect(() => {
    instanceService.initializeInstance<T>(keyRef.current, creatorRef.current);
    return () => {
      instanceService.unmountInstance(key);
    };
  }, [key, instanceService]);

  return instanceService.initializeInstance<T>(keyRef.current, creatorRef.current);
};
