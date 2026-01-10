import { TreeID } from 'loro-crdt';
import { TaskObjectSchema } from '../type';

export interface NavigationPath {
  path: string;
  state?: {
    highlightTaskId: TreeID;
  };
}

/**
 * Get navigation path and state for a TaskObjectSchema item
 * @param item - The item to navigate to (area, project, task, or projectHeading)
 * @param taskObjectMap - Map of task object IDs to their schemas
 * @returns Navigation path with optional state, or null if navigation is not supported
 */
export function getNavigationPath(
  item: TaskObjectSchema,
  taskObjectMap: Map<string, TaskObjectSchema>
): NavigationPath | null {
  switch (item.type) {
    case 'area':
      return { path: `/desktop/area/${item.uid}` };

    case 'project':
      return { path: `/desktop/project/${item.uid}` };

    case 'task': {
      const parentId = item.parentId;
      if (!parentId) {
        // Task with no parent goes to inbox
        return {
          path: '/desktop/inbox',
          state: { highlightTaskId: item.id },
        };
      }

      const parent = taskObjectMap.get(parentId);
      if (!parent) {
        // Parent not found in map
        return null;
      }

      if (parent.type === 'area') {
        return {
          path: `/desktop/area/${parent.uid}`,
          state: { highlightTaskId: item.id },
        };
      }

      if (parent.type === 'project') {
        return {
          path: `/desktop/project/${parent.uid}`,
          state: { highlightTaskId: item.id },
        };
      }

      if (parent.type === 'projectHeading') {
        // Resolve projectHeading to its parent project
        const projectId = parent.parentId;
        const project = taskObjectMap.get(projectId);
        if (project && project.type === 'project') {
          return {
            path: `/desktop/project/${project.uid}`,
            state: { highlightTaskId: item.id },
          };
        }
        // Project not found or invalid type
        return null;
      }

      // Invalid parent type
      return null;
    }

    case 'projectHeading':
      // ProjectHeading navigation not supported per requirements
      return null;
  }
}
