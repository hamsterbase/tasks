import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ITodoService } from '@/services/todo/common/todoService';
import React from 'react';
import { useParams } from 'react-router';

export const ProjectPage = () => {
  const { projectUid } = useParams<{ projectUid: string }>();
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);

  return <div>{projectUid}</div>;
};
