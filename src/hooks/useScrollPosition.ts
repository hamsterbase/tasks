import { useEffect, useRef } from 'react';

const scrollCache = new Map<string, number>();

export const useScrollPosition = (key: string) => {
  const scrollPosition = useRef(0);

  useEffect(() => {
    const savedScrollPosition = scrollCache.get(key) ?? 0;
    if (savedScrollPosition && savedScrollPosition > 0) {
      window.scrollTo(0, savedScrollPosition);
    }
    const handleScroll = () => {
      scrollPosition.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollCache.set(key, scrollPosition.current);
    };
  }, [key]);
};
