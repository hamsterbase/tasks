import type { ITaskModelData, TaskViewSchema } from '../../type.ts';

export function getView(modelData: ITaskModelData, uid: string): TaskViewSchema | null {
  return modelData.views.find((v) => v.uid === uid) ?? null;
}
