import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export const useDesktopDndSensors = () => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });
  return useSensors(mouseSensor, touchSensor);
};
