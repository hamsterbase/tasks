import { useService } from '@/hooks/use-service';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { TagEditorOverlayController } from './TagEditorOverlayController';

export const useTagEditor = () => {
  const instantiationService = useService(IInstantiationService);

  const openTagEditor = (
    initialTags: string[] = [],
    allTags: string[],
    onUpdate: (tags: string[]) => void,
    position?: { x: number; y: number }
  ) => {
    return TagEditorOverlayController.create(initialTags, allTags, onUpdate, instantiationService, position);
  };

  return { openTagEditor };
};
