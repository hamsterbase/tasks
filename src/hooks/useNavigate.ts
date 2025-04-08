import { INavigationService, NavigateOptions } from '@/services/navigationService/common/navigationService';
import { useService } from './use-service';

const useNavigate = () => {
  const navigationService = useService(INavigationService);
  return (options: NavigateOptions) => {
    navigationService.navigate(options);
  };
};

export default useNavigate;
