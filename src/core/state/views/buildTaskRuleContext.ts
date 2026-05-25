import type { TaskRuleContext } from '../../filter/taskRuleSchema.ts';
import type { ITaskModelData } from '../../type.ts';

/**
 * Walks the parent chain of a task to derive its rule context: which kind of
 * container it sits in (inbox / project / area / heading / task), plus the
 * titles of its enclosing project and area when present.
 */
export function buildTaskRuleContext(
  modelData: ITaskModelData,
  parentId: string | undefined
): TaskRuleContext {
  if (!parentId) {
    return { parent: 'inbox', projectTitle: '', areaTitle: '' };
  }
  const parent = modelData.taskObjectMap.get(parentId);
  if (!parent) {
    return { parent: 'inbox', projectTitle: '', areaTitle: '' };
  }
  if (parent.type === 'project') {
    return {
      parent: 'project',
      projectTitle: parent.title ?? '',
      areaTitle: resolveAreaTitle(modelData, parent.parentId),
    };
  }
  if (parent.type === 'projectHeading') {
    const project = parent.parentId ? modelData.taskObjectMap.get(parent.parentId) : undefined;
    if (project?.type === 'project') {
      return {
        parent: 'heading',
        projectTitle: project.title ?? '',
        areaTitle: resolveAreaTitle(modelData, project.parentId),
      };
    }
    return { parent: 'heading', projectTitle: '', areaTitle: '' };
  }
  if (parent.type === 'area') {
    return { parent: 'area', projectTitle: '', areaTitle: parent.title ?? '' };
  }
  if (parent.type === 'task') {
    return { parent: 'task', projectTitle: '', areaTitle: '' };
  }
  return { parent: 'inbox', projectTitle: '', areaTitle: '' };
}

function resolveAreaTitle(modelData: ITaskModelData, parentId: string | undefined): string {
  if (!parentId) return '';
  const node = modelData.taskObjectMap.get(parentId);
  if (node?.type === 'area') return node.title ?? '';
  return '';
}
