import { useService } from '@/hooks/use-service';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { DesktopMessageController, MessageOptions } from './DesktopMessageController';

export const useDesktopMessage = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: MessageOptions) => {
    return DesktopMessageController.create(options, instantiationService);
  };
};
