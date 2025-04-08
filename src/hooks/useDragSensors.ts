import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export const useDragSensors = () => {
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  return sensors;
};
