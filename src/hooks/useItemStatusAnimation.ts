import { ITEM_STATUS_TIMING } from '@/base/common/itemStatusAnimation';
import { ItemStatusAnimationPhase } from '@/components/todo/itemStatusVisual';
import { ItemStatus } from '@/core/type';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function useItemStatusAnimation(status: ItemStatus): ItemStatusAnimationPhase {
  const previousStatusRef = useRef(status);
  const timersRef = useRef<number[]>([]);
  const [phase, setPhase] = useState<ItemStatusAnimationPhase>('idle');

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  useLayoutEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;
    if (previousStatus === status) {
      return;
    }

    clearTimers();

    if (previousStatus === 'created' && status === 'completed') {
      setPhase('completing');
      timersRef.current.push(
        window.setTimeout(() => setPhase('holding'), ITEM_STATUS_TIMING.strikeDelay + ITEM_STATUS_TIMING.strike),
        window.setTimeout(
          () => setPhase('settling'),
          ITEM_STATUS_TIMING.strikeDelay + ITEM_STATUS_TIMING.strike + ITEM_STATUS_TIMING.hold
        ),
        window.setTimeout(() => setPhase('idle'), ITEM_STATUS_TIMING.keepAlive)
      );
      return;
    }

    if (previousStatus !== 'created' && status === 'created') {
      setPhase('reverting');
      timersRef.current.push(
        window.setTimeout(() => setPhase('settling'), ITEM_STATUS_TIMING.mark),
        window.setTimeout(() => setPhase('idle'), ITEM_STATUS_TIMING.keepAlive)
      );
      return;
    }

    if (status === 'canceled') {
      setPhase('canceling');
      timersRef.current.push(
        window.setTimeout(() => setPhase('settling'), ITEM_STATUS_TIMING.strikeDelay + ITEM_STATUS_TIMING.strike),
        window.setTimeout(() => setPhase('idle'), ITEM_STATUS_TIMING.keepAlive)
      );
      return;
    }

    setPhase('idle');
  }, [status]);

  useEffect(() => clearTimers, []);

  return phase;
}
