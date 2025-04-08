import { About } from '@/plugins/about';

export const useAbout = () => {
  const showAbout = async (options?: { showICP?: boolean; displayMode?: string }) => {
    return About.showAbout(options);
  };

  return {
    showAbout,
  };
};
