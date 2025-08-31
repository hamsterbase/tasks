import { useDesktopDialog } from '@/desktop/overlay/desktopDialog/useDesktopDialog';
import { DesktopMenuController, IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController.ts';
import { useService } from '@/hooks/use-service.ts';
import { localize } from '@/nls.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import type { TreeID } from 'loro-crdt';
import { IInstantiationService } from 'vscf/platform/instantiation/common.ts';

export const useAreaDesktopProjectMenu = (areaId: TreeID) => {
  const instantiationService = useService(IInstantiationService);
  const todoService = useService(ITodoService);
  const dialog = useDesktopDialog();

  const handleDeleteArea = () => {
    dialog({
      title: localize('area.delete_area_confirm_title', 'Delete Area'),
      description: localize(
        'area.delete_area_confirm_description',
        'Are you sure you want to delete this area? This action cannot be undone.'
      ),
      onConfirm: () => {
        todoService.deleteItem(areaId);
      },
    });
  };

  function createMenuConfig(): IMenuConfig[] {
    return [
      {
        label: localize('area.delete_area', 'Delete Area'),
        onSelect: handleDeleteArea,
      },
    ];
  }

  function openAreaDesktopMenu(x: number, y: number) {
    const menuConfig = createMenuConfig();
    DesktopMenuController.create(
      {
        menuConfig,
        x,
        y,
      },
      instantiationService
    );
  }

  return {
    openAreaDesktopMenu,
  };
};
