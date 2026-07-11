import { RecurringRule } from '@/core/type';
import { useService } from '@/hooks/use-service';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { RecurringTaskSettingsController } from './RecurringTaskSettingsController';

export const useRecurringTaskSettings = () => {
  const instantiationService = useService(IInstantiationService);

  return (options: RecurringRule, onUpdate: (settings: RecurringRule) => void) => {
    RecurringTaskSettingsController.create(options, onUpdate, instantiationService);
  };
};
