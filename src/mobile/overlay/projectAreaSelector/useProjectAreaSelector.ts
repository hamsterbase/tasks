import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { ProjectAreaSelectorController, ProjectAreaSelectorOptions } from './ProjectAreaSelectorController';

export const useProjectAreaSelector = () => {
  const instantiationService = useService(IInstantiationService);

  return (option: ProjectAreaSelectorOptions) => {
    ProjectAreaSelectorController.create(option, instantiationService);
  };
};
