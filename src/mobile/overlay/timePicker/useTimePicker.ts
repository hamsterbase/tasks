import { CancelError } from '@/base/common/error';
import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { TimePickerActionSheetController } from './TimePickerActionSheetController';

interface TimePickerOptions {
  initialTime: number | undefined;
  onTimeSelected: (time: number) => Promise<void> | void;
  onCancel: () => void;
}

export const useTimePicker = () => {
  const instantiationService = useService(IInstantiationService);

  return {
    showTimePicker: (options: TimePickerOptions) => {
      TimePickerActionSheetController.create(
        options.initialTime,
        options.onTimeSelected,
        options.onCancel,
        instantiationService
      );
    },
    showTimePickerPromise: (initialTime?: number): Promise<number> => {
      return new Promise((resolve, reject) => {
        TimePickerActionSheetController.create(
          initialTime,
          (time: number) => {
            resolve(time);
          },
          () => {
            reject(new CancelError());
          },
          instantiationService
        );
      });
    },
  };
};
