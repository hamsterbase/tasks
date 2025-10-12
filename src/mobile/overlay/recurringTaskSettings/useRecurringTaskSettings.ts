import { RecurringRule } from '@/core/type';
import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { RecurringTaskSettingsDialogController } from './RecurringTaskSettingsDialogController';

export const useRecurringTaskSettings = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: RecurringRule, onUpdate: (settings: RecurringRule) => void) => {
    RecurringTaskSettingsDialogController.create(options, onUpdate, instantiationService);
  };
};
