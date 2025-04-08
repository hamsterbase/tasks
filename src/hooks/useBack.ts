import { useNavigate } from 'react-router';

export const useBack = (fallbackPath: string = '/') => {
  const navigate = useNavigate();

  return () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };
};
