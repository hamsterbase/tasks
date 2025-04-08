import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { DatePickerActionSheetController } from './DatePickerActionSheetController';

export const useDatepicker = () => {
  const instantiationService = useService(IInstantiationService);

  return (initialDate: number | undefined, onDateSelected: (date: number) => void) => {
    DatePickerActionSheetController.create(initialDate, onDateSelected, instantiationService);
  };
};
