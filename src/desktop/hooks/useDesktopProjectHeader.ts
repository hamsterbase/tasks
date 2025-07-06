import { ProjectHeadingInfo } from '@/core/state/type';
import { DesktopMenuController, IMenuConfig } from '@/desktop/overlay/desktopMenu/DesktopMenuController';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { IInstantiationService } from 'vscf/platform/instantiation/common';

interface IUseDesktopProjectHeaderOptions {
  projectHeadingInfo: ProjectHeadingInfo;
}

export const useDesktopProjectHeader = (options: IUseDesktopProjectHeaderOptions) => {
  const { projectHeadingInfo } = options;
  const instantiationService = useService(IInstantiationService);
  const todoService = useService(ITodoService);

  const handleDeleteHeading = () => {
    todoService.deleteItem(projectHeadingInfo.id);
  };

  const handleConvertToProject = () => {
    todoService.covertToProject(projectHeadingInfo.id);
  };

  function createMenuConfig(): IMenuConfig[] {
    return [
      {
        label: localize('project_heading.convert_to_project', 'Convert to Project'),
        onSelect: handleConvertToProject,
      },
      {
        label: localize('project_heading.delete_heading', 'Delete Heading'),
        onSelect: handleDeleteHeading,
      },
    ];
  }

  function handleMenuClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = rect.right;
    const y = rect.bottom;

    const menuConfig = createMenuConfig();
    DesktopMenuController.create(
      {
        menuConfig,
        x,
        y,
        placement: 'bottom-end',
      },
      instantiationService
    );
  }

  return {
    projectHeadingInfo,
    handleMenuClick,
  };
};
