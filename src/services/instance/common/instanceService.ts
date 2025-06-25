import { createDecorator, IInstantiationService } from 'vscf/platform/instantiation/common';

export interface IWorkbenchInstance {
  mount(): void;
  unmount(): void;
}

export interface IWorkbenchInstanceService {
  readonly _serviceBrand: undefined;

  getInstance<T>(key: string): T | null;

  initializeInstance<T extends IWorkbenchInstance>(key: string, creator: unknown): T;

  unmountInstance(key: string): void;

  hasInstance(key: string): boolean;
}

export class WorkbenchInstanceService implements IWorkbenchInstanceService {
  public readonly _serviceBrand: undefined;

  private readonly _instances = new Map<string, IWorkbenchInstance>();
  private readonly _mountedInstances = new Set<string>();

  constructor(@IInstantiationService private readonly instantiationService: IInstantiationService) {}

  getInstance<T>(key: string): T | null {
    return (this._instances.get(key) as T) ?? null;
  }

  initializeInstance<T extends IWorkbenchInstance>(key: string, creator: unknown): T {
    if (this._instances.has(key)) {
      const existingInstance = this._instances.get(key) as T;
      if (this._mountedInstances.has(key)) {
        return existingInstance;
      }
      existingInstance.mount();
      this._mountedInstances.add(key);
      return existingInstance;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = this.instantiationService.createInstance(creator as any) as T;
    instance.mount();
    this._mountedInstances.add(key);
    this._instances.set(key, instance);
    return instance;
  }

  unmountInstance(key: string): void {
    const instance = this._instances.get(key);
    if (instance) {
      instance.unmount();
      this._mountedInstances.delete(key);
    }
  }

  hasInstance(key: string): boolean {
    return this._instances.has(key);
  }
}

export const IWorkbenchInstanceService = createDecorator<IWorkbenchInstanceService>('workbenchInstanceService');
