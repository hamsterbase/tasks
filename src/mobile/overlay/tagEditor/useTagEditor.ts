import { useService } from '@/hooks/use-service';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { TagEditorActionSheetController } from './TagEditorActionSheetController';

export const useTagEditor = () => {
  const instantiationService = useService(IInstantiationService);

  return (tags: string[], onSave: (tags: string[]) => void) => {
    TagEditorActionSheetController.create(tags, onSave, instantiationService);
  };
};
