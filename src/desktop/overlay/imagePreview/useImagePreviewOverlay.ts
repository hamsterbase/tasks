import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { ImagePreviewController, ImagePreviewOptions } from './ImagePreviewController';

export const useImagePreviewOverlay = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: ImagePreviewOptions) => {
    return ImagePreviewController.create(options, instantiationService);
  };
};
