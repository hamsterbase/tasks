import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { TimePickerOverlayController } from './TimePickerOverlayController';

export const useTimepicker = () => {
  const instantiationService = useService(IInstantiationService);

  return (
    initialDate: number | undefined,
    onDateSelected: (date: number | null) => void,
    position?: { x: number; y: number }
  ) => {
    TimePickerOverlayController.create(initialDate, onDateSelected, instantiationService, position);
  };
};
