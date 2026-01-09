import { useCallback, useEffect, useRef } from 'react';
import { Event } from 'vscf/base/common/event';

interface UseAutoScrollOptions {
  /** 判断是否在底部附近的阈值，默认 100px */
  threshold?: number;
  /** 状态变化事件，用于触发滚动检查 */
  onStateChange?: Event<void>;
  /** 是否正在加载/流式输出 */
  isLoading?: boolean;
}

interface UseAutoScrollResult {
  /** 滚动容器的 ref */
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  /** 滚动到底部 */
  scrollToBottom: () => void;
}

export function useAutoScroll(options: UseAutoScrollOptions = {}): UseAutoScrollResult {
  const { threshold = 100, onStateChange, isLoading = false } = options;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userHasScrolledUpRef = useRef(false);
  const lastScrollTopRef = useRef(0);

  const isNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollTop + clientHeight >= scrollHeight - threshold;
  }, [threshold]);

  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, []);

  // 处理用户滚动事件
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const isScrollingUp = currentScrollTop < lastScrollTopRef.current;
      lastScrollTopRef.current = currentScrollTop;

      if (isScrollingUp && !isNearBottom()) {
        // 用户向上滚动且不在底部附近，标记为用户主动滚动
        userHasScrolledUpRef.current = true;
      } else if (isNearBottom()) {
        // 用户滚动回底部，恢复自动滚动
        userHasScrolledUpRef.current = false;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isNearBottom]);

  // 监听状态变化，执行自动滚动
  useEffect(() => {
    if (!onStateChange) return;

    const disposable = onStateChange(() => {
      // 只有在用户没有主动向上滚动时才自动滚动
      if (!userHasScrolledUpRef.current) {
        // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    });

    return () => disposable.dispose();
  }, [onStateChange, scrollToBottom]);

  // 当 isLoading 从 true 变为 false 时，重置用户滚动状态
  useEffect(() => {
    if (!isLoading) {
      // 流式输出结束，如果用户在底部附近，重置滚动状态
      if (isNearBottom()) {
        userHasScrolledUpRef.current = false;
      }
    }
  }, [isLoading, isNearBottom]);

  return {
    scrollContainerRef,
    scrollToBottom,
  };
}
