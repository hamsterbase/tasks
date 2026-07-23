import type { TransitionEvent } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

// Longer than the longest themed expand duration so content is never unmounted mid-transition.
const COLLAPSE_UNMOUNT_FALLBACK_MS = 300;

/**
 * Drives a mount -> expand -> collapse -> unmount cycle so a
 * `grid-template-rows: 0fr <-> 1fr` transition can play in both directions.
 *
 * - `mounted`: whether the expandable content should be rendered at all
 * - `expanded`: whether to apply the open (1fr) class
 * - `expandRef`: attach to the animated grid element
 * - `handleTransitionEnd`: attach to the grid element to unmount after collapsing
 *
 * All state flips happen in a layout effect (before paint): the closed state is
 * force-reflowed and then switched to open within the same frame, so the
 * transition starts on the very first painted frame with no idle frames.
 */
export const useExpandTransition = (isOpen: boolean) => {
  const [mounted, setMounted] = useState(isOpen);
  const [expanded, setExpanded] = useState(false);
  const expandRef = useRef<HTMLDivElement | null>(null);
  const collapseTimer = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (isOpen) {
      window.clearTimeout(collapseTimer.current);
      if (!mounted) {
        // Commit the content in its closed state first; this effect re-runs
        // with mounted=true in the same frame and performs the expansion.
        setMounted(true);
        return;
      }
      // Force the closed state to be styled so the open class transitions from it.
      expandRef.current?.getBoundingClientRect();
      setExpanded(true);
      return;
    }
    setExpanded(false);
    if (!mounted) {
      return;
    }
    // transitionend can be missed (e.g. hidden tab); make sure we still unmount.
    collapseTimer.current = window.setTimeout(() => setMounted(false), COLLAPSE_UNMOUNT_FALLBACK_MS);
    return () => window.clearTimeout(collapseTimer.current);
  }, [isOpen, mounted]);

  const handleTransitionEnd = (e: TransitionEvent<HTMLElement>) => {
    if (!isOpen && e.target === e.currentTarget) {
      window.clearTimeout(collapseTimer.current);
      setMounted(false);
    }
  };

  return { mounted, expanded, expandRef, handleTransitionEnd };
};
