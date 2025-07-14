import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { DesktopMessageController, MessageOptions } from './DesktopMessageController';

export const useDesktopMessage = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: MessageOptions) => {
    return DesktopMessageController.create(options, instantiationService);
  };
};