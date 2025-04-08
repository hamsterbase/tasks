import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { DialogController, DialogOptions } from './DialogController';

export const useDialog = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: DialogOptions) => {
    return DialogController.create(options, instantiationService);
  };
};
