import { CreateTaskSchema } from './type';

import { UpdateProjectSchema, UpdateTaskSchema } from './type';

export interface FilterCondition {
  listName: string;
  meetTaskCreationCriteria: (payload: CreateTaskSchema) => boolean;
  meetTaskUpdateCriteria: (payload: UpdateTaskSchema) => boolean;
  meetProjectUpdateCriteria: (payload: UpdateProjectSchema) => boolean;
}

export const dateAssigned: FilterCondition = {
  listName: 'dateAssigned',
  meetTaskCreationCriteria: (payload) => {
    return !!payload.startDate || !!payload.dueDate;
  },
  meetTaskUpdateCriteria: (payload) => {
    return !!payload.startDate || !!payload.dueDate;
  },
  meetProjectUpdateCriteria: (payload) => {
    return !!payload.startDate || !!payload.dueDate;
  },
};

export const filterConditions = [dateAssigned];
