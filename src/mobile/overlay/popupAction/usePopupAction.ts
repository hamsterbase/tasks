import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { PopupActionController, PopupActionControllerOptions } from './PopupActionController';

export const usePopupAction = () => {
  const instantiationService = useService(IInstantiationService);

  return (initOptions: PopupActionControllerOptions) => {
    PopupActionController.create(initOptions, instantiationService);
  };
};
