import { getAreaDetail } from '@/core/state/getArea';
import { AreaDetailState } from '@/core/state/type';
import { useService } from '@/hooks/use-service';
import { ITodoService } from '@/services/todo/common/todoService';
import { TreeID } from 'loro-crdt';
import { useWatchEvent } from './use-watch-event';

export const useAreaDetail = (areaId?: TreeID) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  let areaDetail: AreaDetailState | null = null;
  try {
    if (areaId) {
      areaDetail = getAreaDetail(todoService.modelState, areaId);
    }
  } catch (error) {
    console.error(error);
  }

  return {
    areaDetail,
  };
};
