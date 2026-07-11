import { useService } from '@/hooks/use-service';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { CreateDatabaseController, CreateDatabaseOptions } from './CreateDatabaseController';

export const useCreateDatabaseOverlay = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: CreateDatabaseOptions) => {
    return CreateDatabaseController.create(options, instantiationService);
  };
};
