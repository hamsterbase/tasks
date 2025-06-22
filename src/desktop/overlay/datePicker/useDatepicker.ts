import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { DatePickerOverlayController } from './DatePickerOverlayController';

export const useDatepicker = () => {
  const instantiationService = useService(IInstantiationService);

  return (
    initialDate: number | undefined,
    onDateSelected: (date: number) => void,
    position?: { x: number; y: number }
  ) => {
    DatePickerOverlayController.create(initialDate, onDateSelected, instantiationService, position);
  };
};
