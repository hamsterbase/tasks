import type { TreeID } from 'loro-crdt';
import { ITaskModelData, ProjectInfoState } from './type.ts';
import { getTaskInfoList } from './getTaskInfo.ts';
import { getProjectHeadingInfoList } from './getProjectHeadingInfo.ts';
import { localize } from '@/nls.ts';

export function getProject(modelData: ITaskModelData, projectId: string): ProjectInfoState {
  const objectData = modelData.taskObjectMap.get(projectId);
  if (!objectData) {
    throw new Error(`project not found: ${projectId}`);
  }
  if (objectData.type !== 'project') {
    throw new Error(`invalid project id: ${projectId}, type: ${objectData.type}`);
  }
  const tasks = getTaskInfoList(modelData, objectData.children);
  const projectHeadings = getProjectHeadingInfoList(modelData, objectData.children);

  let complete = 0;
  let total = 0;
  tasks.forEach((task) => {
    if (task.status !== 'created') {
      complete++;
    }
    total++;
  });
  projectHeadings.forEach((projectHeading) => {
    projectHeading.tasks.forEach((task) => {
      if (task.status !== 'created') {
        complete++;
      }
      total++;
    });
  });

  let areaTitle;
  if (objectData.parentId) {
    const parentObject = modelData.taskObjectMap.get(objectData.parentId);
    if (parentObject?.type === 'area') {
      areaTitle = parentObject.title ?? localize('area.untitled', 'New Area');
    }
  }

  return {
    type: 'project',
    title: objectData.title,
    id: objectData.id as TreeID,
    areaTitle,
    uid: objectData.uid,
    tags: objectData.tags,
    status: objectData.status,
    completionAt: objectData.completionAt,
    notes: objectData.notes,
    startDate: objectData.startDate,
    dueDate: objectData.dueDate,
    tasks,
    projectHeadings,
    progress: total === 0 ? 0 : complete / total,
    totalTasks: total,
    completedTasks: complete,
  };
}

export function getProjectList(modelData: ITaskModelData, projectId: string[]): ProjectInfoState[] {
  return projectId
    .map((id) => {
      const projectObject = modelData.taskObjectMap.get(id);
      if (projectObject?.type !== 'project') {
        return null;
      }
      return getProject(modelData, id);
    })
    .filter((item) => item !== null) as ProjectInfoState[];
}
