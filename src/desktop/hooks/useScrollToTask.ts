import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function useScrollToTask() {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { highlightTaskId?: string };
    const highlightTaskId = state?.highlightTaskId;

    if (!highlightTaskId) {
      return;
    }

    let animationTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const maxAttempts = 20; // Try for up to 2 seconds (20 * 100ms)

    const tryScrollToTask = () => {
      const taskElement = document.querySelector(`[data-task-id="${highlightTaskId}"]`) as HTMLElement;

      if (taskElement) {
        // Scroll to the task with smooth behavior
        taskElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        // Add highlight class
        taskElement.classList.add('animate-[highlight_2.5s_ease-in-out]');

        // Remove highlight class after animation completes
        animationTimeoutId = setTimeout(() => {
          taskElement.classList.remove('animate-[highlight_2.5s_ease-in-out]');
        }, 2500);
      } else if (attempts < maxAttempts) {
        // Retry if element not found
        attempts++;
        setTimeout(tryScrollToTask, 100);
      }
    };

    // Start trying to scroll after initial render
    const initialTimeoutId = setTimeout(tryScrollToTask, 100);

    return () => {
      clearTimeout(initialTimeoutId);
      if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
      }
    };
  }, [location]);
}
