import { getPeerId, resetPeerId } from '@/base/browser/getPeerId';
import { TaskModel } from '@/core/model.ts';
import { ITaskModelData } from '@/core/type';
import {
  CreateAreaSchema,
  CreateProjectHeadingSchema,
  CreateProjectSchema,
  CreateReminderSchema,
  CreateTaskSchema,
  ItemMovePosition,
  ProjectStatusTransition,
  ReminderWithId,
  UpdateAreaSchema,
  UpdateProjectHeadingSchema,
  UpdateProjectSchema,
  UpdateReminderSchema,
  UpdateTaskSchema,
} from '@/core/type.ts';
import { IDatabaseStorage } from '@/services/database/common/database';
import { EditingContent, ITodoService } from '@/services/todo/common/todoService.ts';
import { decodeBase64, encodeBase64, VSBuffer } from 'vscf/base/common/buffer';
import { DisposableStore } from 'vscf/base/common/lifecycle';
import type { TreeID } from 'loro-crdt';
import { debounceTime, Subject } from 'rxjs';
import { Emitter } from 'vscf/base/common/event.ts';

interface DateModel {
  taskModel: TaskModel;
  modelData: ITaskModelData;
  dispose: () => void;
  save: () => Promise<void>;
}

export class WorkbenchTodoService implements ITodoService {
  readonly _serviceBrand: undefined;
  private dataModel: DateModel | null = null;
  private _onStateChange: Emitter<void> = new Emitter();
  public onStateChange = this._onStateChange.event;

  private _onEditingContentChange: Emitter<TreeID> = new Emitter();
  public onEditingContentChange = this._onEditingContentChange.event;

  private _editingContent: EditingContent | null = null;

  private _keepAliveElements: string[] = [];
  private _clearKeepAliveSubject = new Subject<void>();

  private _storageId: string | null = null;

  constructor() {
    this._clearKeepAliveSubject.pipe(debounceTime(1000)).subscribe(() => {
      this._keepAliveElements = [];
      this._onStateChange.fire();
    });
  }

  get editingContent() {
    return this._editingContent;
  }

  get storageId() {
    if (!this._storageId) {
      throw new Error('storageId is not initialized');
    }
    return this._storageId;
  }

  public async initStorage(storage: IDatabaseStorage, keepPeerId?: boolean): Promise<void> {
    this._storageId = storage.id;
    const taskModel = new TaskModel();
    if (!keepPeerId) {
      await resetPeerId();
    }
    const peerId = await getPeerId();
    taskModel.setPeerId(peerId);
    async function saveToStorage() {
      const previousKeys = await storage.list();
      if (previousKeys.length > 0) {
        const data = (await Promise.all(previousKeys.map((p) => storage.read(p)))).filter((item) => item);
        await taskModel.import(data.map((item) => decodeBase64(item).buffer));
        await storage.save(encodeBase64(VSBuffer.wrap(taskModel.export())));
        for (const p of previousKeys) {
          await storage.delete(p);
        }
      } else {
        await storage.save(encodeBase64(VSBuffer.wrap(taskModel.export())));
      }
    }
    const disposeStore = new DisposableStore();
    await saveToStorage();
    const dataModel: DateModel = {
      taskModel,
      save: saveToStorage,
      modelData: taskModel.toJSON(),
      dispose: () => {
        disposeStore.dispose();
      },
    };
    disposeStore.add(
      taskModel.onModelChange(() => {
        saveToStorage();
        dataModel.modelData = taskModel.toJSON();
        this._onStateChange.fire();
      })
    );
    if (this.dataModel) {
      this.dataModel.dispose();
    }
    this.dataModel = dataModel;
    this._onStateChange.fire();
  }

  private get taskModel() {
    if (!this.dataModel) {
      throw new Error('dataModel is not initialized');
    }
    return this.dataModel.taskModel;
  }

  get keepAliveElements() {
    if (this.editingContent) {
      return [this.editingContent.id, ...this._keepAliveElements];
    }
    return this._keepAliveElements;
  }

  get modelState() {
    if (!this.dataModel) {
      throw new Error('dataModel is not initialized');
    }
    return this.dataModel.modelData;
  }

  public async import(data: Array<Uint8Array>, databaseId: string) {
    if (this.storageId !== databaseId) {
      throw new Error('storageId is not initialized');
    }
    if (!this.dataModel) {
      throw new Error('dataModel is not initialized');
    }
    const previousVersion = this.dataModel.taskModel.version;
    this.dataModel.taskModel.import(data);
    this.dataModel.modelData = this.dataModel.taskModel.toJSON();
    await this.dataModel.save();
    if (previousVersion.compare(this.dataModel.taskModel.version) !== 0) {
      this._onStateChange.fire();
    }
  }

  public exportPatch(from: Record<string, number>, databaseId: string) {
    if (this.storageId !== databaseId) {
      throw new Error('storageId is not initialized');
    }
    return this.taskModel.exportPatch(from);
  }

  getModelVersion(databaseId: string): Record<string, number> {
    if (this.storageId !== databaseId) {
      throw new Error('storageId is not initialized');
    }
    return this.modelState.version;
  }

  moveDateAssignedList(item: TreeID, position: ItemMovePosition) {
    return this.taskModel.moveDateAssignedList(item, position);
  }

  endEditingContent() {
    if (this._editingContent) {
      this.addKeepAliveElement(this._editingContent.id);
      this._onEditingContentChange.fire(this._editingContent.id);
    }
    this._editingContent = null;
    this._onStateChange.fire();
  }

  addArea(area: CreateAreaSchema): TreeID {
    return this.taskModel.addArea(area);
  }

  addProject(project: CreateProjectSchema): TreeID {
    return this.taskModel.addProject(project);
  }

  addProjectHeading(projectHeading: CreateProjectHeadingSchema): TreeID {
    return this.taskModel.addProjectHeading(projectHeading);
  }
  addTask(task: CreateTaskSchema): TreeID {
    return this.taskModel.addTask(task);
  }

  updateArea(areaId: TreeID, payload: UpdateAreaSchema) {
    return this.taskModel.updateArea(areaId, payload);
  }
  updateProjectHeading(projectHeadingId: TreeID, payload: UpdateProjectHeadingSchema) {
    return this.taskModel.updateProjectHeading(projectHeadingId, payload);
  }

  updateTask(taskId: TreeID, payload: UpdateTaskSchema) {
    this.addKeepAliveElement(taskId);
    return this.taskModel.updateTask(taskId, payload);
  }

  deleteItem(itemId: TreeID) {
    return this.taskModel.deleteItem(itemId);
  }

  updateProject(projectId: TreeID, payload: UpdateProjectSchema) {
    return this.taskModel.updateProject(projectId, payload);
  }
  covertToProject(itemId: TreeID) {
    return this.taskModel.covertToProject(itemId);
  }

  transitionProjectState(options: ProjectStatusTransition) {
    return this.taskModel.transitionProjectState(options);
  }

  private addKeepAliveElement(element: string) {
    this._clearKeepAliveSubject.next();
    this._keepAliveElements.push(element);
    this._onStateChange.fire();
  }

  editItem(itemId: TreeID) {
    this._editingContent = {
      id: itemId,
    };
    this._onEditingContentChange.fire(itemId);
  }

  addReminder(data: CreateReminderSchema): string {
    return this.taskModel.addReminder(data);
  }

  updateReminder(reminderId: string, data: UpdateReminderSchema): void {
    return this.taskModel.updateReminder(reminderId, data);
  }

  deleteReminder(reminderId: string): void {
    return this.taskModel.deleteReminder(reminderId);
  }

  getReminders(): Map<TreeID, ReminderWithId[]> {
    return this.taskModel.getReminders();
  }
}
