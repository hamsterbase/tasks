import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ITodoService } from '@/services/todo/common/todoService';
import React from 'react';
import { useParams } from 'react-router';

export const AreaPage = () => {
  const { areaUid } = useParams<{ areaUid: string }>();
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  return <div>{areaUid}</div>;
};
