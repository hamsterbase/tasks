import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { TagEditorActionSheetController } from './TagEditorActionSheetController';

export const useTagEditor = () => {
  const instantiationService = useService(IInstantiationService);

  return (tags: string[], onSave: (tags: string[]) => void) => {
    TagEditorActionSheetController.create(tags, onSave, instantiationService);
  };
};
