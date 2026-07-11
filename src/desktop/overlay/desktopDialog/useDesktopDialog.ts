import { useService } from '@/hooks/use-service';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { DesktopDialogController, DialogOptions } from './DesktopDialogController';

export const useDesktopDialog = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: DialogOptions) => {
    return DesktopDialogController.create(options, instantiationService);
  };
};
