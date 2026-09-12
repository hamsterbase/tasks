import { TaskModel } from '../../core/model';
import { readSnapshotBlobs } from './databases';

export async function loadModel(databaseId: string, dataDir?: string): Promise<TaskModel> {
  const blobs = await readSnapshotBlobs(databaseId, dataDir);
  const model = new TaskModel();
  model.import(blobs);
  return model;
}
