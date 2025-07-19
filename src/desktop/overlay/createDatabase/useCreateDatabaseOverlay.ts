import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { CreateDatabaseController, CreateDatabaseOptions } from './CreateDatabaseController';

export const useCreateDatabaseOverlay = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: CreateDatabaseOptions) => {
    return CreateDatabaseController.create(options, instantiationService);
  };
};
