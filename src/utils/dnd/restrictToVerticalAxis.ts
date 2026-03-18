import { Modifier } from '@dnd-kit/core';

export const restrictToVerticalAxis: Modifier = ({ transform, ...res }) => {
  if (!res.containerNodeRect || !res.draggingNodeRect) return { ...transform, x: 0 };

  const maxY = res.containerNodeRect.bottom - res.draggingNodeRect.bottom;
  const minY = res.containerNodeRect.top - res.draggingNodeRect.top;

  return {
    ...transform,
    x: 0,
    y: Math.min(Math.max(transform?.y ?? 0, minY), maxY),
  };
};
