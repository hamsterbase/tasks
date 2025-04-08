// @ts-nocheck
export { SyncDescriptor } from 'vscf/internal/platform/instantiation/common/descriptors.ts';
export {
  IInstantiationService,
  createDecorator,
  refineServiceDecorator,
} from 'vscf/internal/platform/instantiation/common/instantiation.ts';

export type { ServicesAccessor } from 'vscf/internal/platform/instantiation/common/instantiation.ts';

export type { ServiceIdentifier } from 'vscf/internal/platform/instantiation/common/instantiation.ts';
export { InstantiationService } from 'vscf/internal/platform/instantiation/common/instantiationService.ts';
export { ServiceCollection } from 'vscf/internal/platform/instantiation/common/serviceCollection.ts';

export {
  InstantiationType,
  getSingletonServiceDescriptors,
  registerSingleton,
} from 'vscf/internal/platform/instantiation/common/extensions.ts';
