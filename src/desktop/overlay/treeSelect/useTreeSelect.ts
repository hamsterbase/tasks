import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { TreeID } from 'loro-crdt';
import { TreeSelectController } from './TreeSelectController';

interface UseTreeSelectOptions {
  onConfirm: (id: TreeID) => void;
  currentItemId?: TreeID;
}

export function useTreeSelect() {
  const instantiationService = useService(IInstantiationService);

  return (x: number, y: number, options: UseTreeSelectOptions) => {
    TreeSelectController.create(
      {
        x,
        y,
        onConfirm: options.onConfirm,
        currentItemId: options.currentItemId,
      },
      instantiationService
    );
  };
}
