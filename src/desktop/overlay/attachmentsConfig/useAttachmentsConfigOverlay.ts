import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { AttachmentsConfigController, AttachmentsConfigOptions } from './AttachmentsConfigController';

export const useAttachmentsConfigOverlay = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: AttachmentsConfigOptions) => {
    return AttachmentsConfigController.create(options, instantiationService);
  };
};
