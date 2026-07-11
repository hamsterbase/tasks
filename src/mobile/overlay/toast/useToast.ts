import { useService } from '@/hooks/use-service';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { ToastController, ToastOptions } from './ToastController';

export const useToast = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: ToastOptions) => {
    ToastController.create(options, instantiationService);
  };
};
