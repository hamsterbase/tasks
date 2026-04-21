import { TaskModel } from '../core/model';
import { readSnapshotBlobs } from './databases';

export async function loadModel(databaseId: string): Promise<TaskModel> {
  const blobs = await readSnapshotBlobs(databaseId);
  const model = new TaskModel();
  model.import(blobs);
  return model;
}
