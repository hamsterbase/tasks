import { useService } from '@/hooks/use-service';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { PopupActionController, PopupActionControllerOptions } from './PopupActionController';

export const usePopupAction = () => {
  const instantiationService = useService(IInstantiationService);

  return (initOptions: PopupActionControllerOptions) => {
    PopupActionController.create(initOptions, instantiationService);
  };
};
