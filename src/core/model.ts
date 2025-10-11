import { ItemStatusEnum, ModelKeys, ModelTypes } from '@/core/enum.ts';
import { LoroDoc, LoroMap, LoroMovableList, LoroTreeNode, PeerID, TreeID, VersionVector } from 'loro-crdt';
import { nanoid } from 'nanoid';
import { Emitter } from 'vscf/base/common/event.ts';
import { dateAssigned, FilterCondition, filterConditions } from './list.ts';
import { getInvalidTaskData } from './state/getInvalidTaskData.ts';
import { createRecurringTask } from './state/createRecurringTask.ts';
import {
  AreaSchema,
  CreateAreaSchema,
  CreateProjectHeadingSchema,
  CreateProjectSchema,
  CreateReminderSchema,
  CreateTaskSchema,
  ITaskModelData,
  ItemMovePosition,
  ItemPosition,
  ItemStatus,
  ProjectHeadingSchema,
  ProjectLoroSchema,
  ProjectSchema,
  ReminderSchema,
  ReminderWithId,
  TaskLoroSchema,
  TaskObjectSchema,
  TaskObjectType,
  TaskSchema,
  ToLoro,
  UpdateAreaSchema,
  UpdateProjectHeadingSchema,
  UpdateProjectSchema,
  UpdateReminderSchema,
  UpdateTaskSchema,
} from './type.ts';
import { patch } from './utils.ts';

const ParentRules: Record<string, string[]> = {
  [ModelTypes.task]: [ModelTypes.area, ModelTypes.project, ModelTypes.projectHeading, ModelTypes.root, ModelTypes.task],
  [ModelTypes.projectHeading]: [ModelTypes.project],
  [ModelTypes.project]: [ModelTypes.area, ModelTypes.root],
  [ModelTypes.area]: [ModelTypes.root],
  [ModelTypes.root]: [],
};

export class TaskModel {
  private doc: LoroDoc;

  get version() {
    return this.doc.version();
  }

  private _onModelChange: Emitter<void> = new Emitter();
  public onModelChange = this._onModelChange.event;

  constructor() {
    this.doc = new LoroDoc();
    this.doc.subscribeLocalUpdates(() => {
      this._onModelChange.fire();
    });
  }

  setPeerId(peerId: `${number}`) {
    this.doc.setPeerId(peerId);
  }

  import(data: Array<Uint8Array>) {
    data.forEach((d) => {
      this.doc.import(d);
    });
    this.removeDuplicateItems(this.doc.getMovableList(dateAssigned.listName) as LoroMovableList<TreeID>);
    this.doc
      .getTree('todo')
      .getNodes()
      .forEach((node) => {
        if (!node.data.get('uid')) {
          node.data.set('uid', nanoid(12));
        }
      });
  }

  exportPatch(from: Record<string, number>): Uint8Array {
    const map = new Map<PeerID, number>();
    Object.entries(from || {}).forEach(([peerId, version]) => {
      map.set(peerId as PeerID, version);
    });
    return this.doc.export({ mode: 'update', from: VersionVector.parseJSON(map) });
  }

  private removeDuplicateItems(list: LoroMovableList<TreeID>) {
    const items = list.toArray();
    const itemIndexMap = new Map<TreeID, number>();
    items.forEach((item, index) => {
      if (!itemIndexMap.has(item)) {
        itemIndexMap.set(item, index);
      }
    });
    for (let i = items.length - 1; i >= 0; i--) {
      if (itemIndexMap.get(items[i]) !== i) {
        list.delete(i, 1);
      }
    }
  }

  export() {
    return this.doc.export({ mode: 'snapshot' });
  }

  addArea(area: CreateAreaSchema) {
    const node = this.createNodeInPosition(
      ModelTypes.area,
      area.position ?? { type: 'firstElement', parentId: undefined }
    );
    const map = node.data;
    map.set(ModelKeys.title, area.title);
    map.set(ModelKeys.createdAt, Date.now());
    map.setContainer(ModelKeys.tags, new LoroMovableList());
    this.doc.commit();
    return node.id;
  }

  updateArea(areaId: TreeID, newArea: UpdateAreaSchema) {
    if (!areaId) {
      throw new Error('area id should be provided');
    }
    const area = this.getArea(areaId);
    const map = this.getTree().getNodeByID(areaId)!.data;
    patch(area, newArea, map, ['title', 'tags']);
    if (newArea.position) {
      this.moveNode(areaId, newArea.position);
    }
    this.doc.commit();
  }

  addProject(project: CreateProjectSchema) {
    const noode: LoroTreeNode = this.createNodeInPosition(
      ModelTypes.project,
      project.position ?? { type: 'firstElement', parentId: undefined }
    );
    const map = noode.data;
    map.set(ModelKeys.title, project.title);
    map.set(ModelKeys.createdAt, Date.now());
    map.setContainer(ModelKeys.tags, new LoroMovableList());
    this.doc.commit();
    return noode.id;
  }

  updateProject(projectId: TreeID, payload: UpdateProjectSchema) {
    const { map } = this.getTreeNode(projectId, ModelTypes.project);
    const project = this.getProject(projectId);

    if (payload.position) {
      this.moveNode(projectId, payload.position);
    }
    patch(project, payload, map, ['title', 'notes', 'tags', 'dueDate', 'startDate']);
    this.handleUpdateProject(payload, projectId);
    this.doc.commit();
  }

  addProjectHeading(heading: CreateProjectHeadingSchema) {
    const projectHeading = this.createNodeInPosition(ModelTypes.projectHeading, heading.position);
    const map = projectHeading.data;
    map.set(ModelKeys.title, heading.title);
    map.set(ModelKeys.createdAt, Date.now());
    map.setContainer(ModelKeys.tags, new LoroMovableList());
    this.doc.commit();
    return projectHeading.id;
  }

  updateProjectHeading(projectHeadingId: TreeID, payload: UpdateProjectHeadingSchema) {
    const { map } = this.getTreeNode<TaskLoroSchema>(projectHeadingId, ModelTypes.projectHeading);
    const projectHeading = this.getProjectHeading(projectHeadingId);
    if (payload.position) {
      this.moveNode(projectHeadingId, payload.position);
    }
    patch(
      projectHeading,
      payload,
      map as unknown as LoroMap<Record<string, unknown>>,
      ['title', 'archivedDate'] as const
    );
    this.doc.commit();
  }

  addTask(task: CreateTaskSchema) {
    const noode: LoroTreeNode = this.createNodeInPosition(
      'task',
      task.position ?? { type: 'firstElement', parentId: undefined }
    );
    const map = noode.data;
    map.set(ModelKeys.title, task.title);
    if (task.notes) {
      map.set(ModelKeys.notes, task.notes);
    }
    if (task.startDate) {
      map.set(ModelKeys.startDate, task.startDate);
    }
    if (task.dueDate) {
      map.set(ModelKeys.dueDate, task.dueDate);
    }
    if (task.recurringRule) {
      map.set(ModelKeys.recurringRule, JSON.stringify(task.recurringRule));
    }
    map.set(ModelKeys.createdAt, Date.now());
    const tags = new LoroMovableList();
    if (Array.isArray(task.tags)) {
      task.tags.forEach((tag) => tags.push(tag));
    }
    map.setContainer(ModelKeys.tags, tags);
    this.handleCreateTask(task, noode.id);
    this.doc.commit();
    return noode.id;
  }

  updateTask(taskId: TreeID, newTask: UpdateTaskSchema) {
    const { node, map } = this.getTreeNode<TaskLoroSchema>(taskId, ModelTypes.task);
    const task = this.getTask(taskId);
    if (typeof newTask.status === 'string' && task.status !== newTask.status) {
      this.updateTaskStatus(taskId, newTask.status, newTask.completionAt);
    }
    if (newTask.position) {
      this.moveNode(taskId, newTask.position);
    }
    if (newTask.parentId) {
      if (newTask.previousTaskId) {
        node.moveAfter(this.getTree().getNodeByID(newTask.previousTaskId)!);
      } else {
        node.move(this.getTree().getNodeByID(newTask.parentId), 0);
      }
    }
    patch(task, newTask, map as unknown as LoroMap<Record<string, unknown>>, [
      'title',
      'notes',
      'tags',
      'dueDate',
      'startDate',
    ]);
    if (newTask.recurringRule) {
      map.set(ModelKeys.recurringRule, JSON.stringify(newTask.recurringRule));
    }
    this.handleUpdateTask(newTask, taskId);
    this.doc.commit();
  }

  deleteItem(itemId: TreeID) {
    this.getTree().delete(itemId);
    this.doc.commit();
  }

  transitionProjectState(options: {
    projectId: TreeID;
    projectStatus: ItemStatus;
    taskStatus?: ItemStatus;
    completionAt?: number;
  }) {
    const { projectId, projectStatus, taskStatus, completionAt } = options;
    const { map, children } = this.getTreeNode<ProjectLoroSchema>(projectId, ModelTypes.project);
    if (projectStatus === ItemStatusEnum.created) {
      if (map.get(ModelKeys.completion)) {
        const completion = JSON.parse(map.get(ModelKeys.completion) as string);
        map.set(ModelKeys.completion, JSON.stringify({ type: 'created', timestamp: completion.timestamp }));
      }
    } else {
      const allTasks = children
        .map((childId): TaskSchema[] => {
          const taskObject = this.readTaskObject(childId);
          if (taskObject && taskObject.type === ModelTypes.task) {
            return [taskObject];
          }
          if (taskObject && taskObject.type === ModelTypes.projectHeading) {
            return taskObject.children.map((childId) => this.readTaskObject(childId));
          }
          return [];
        })
        .flat();

      const unfinishedTasks = allTasks.filter((task) => task.status === ItemStatusEnum.created);
      if (unfinishedTasks.length > 0) {
        if (!taskStatus) {
          throw new Error('Task status must be provided when there are unfinished tasks.');
        }

        unfinishedTasks.forEach((task) => {
          this.updateTaskStatus(task.id, taskStatus, task.completionAt);
        });
      }
      const { map } = this.getTreeNode<ProjectLoroSchema>(projectId, ModelTypes.project);
      map.set(ModelKeys.completion, JSON.stringify({ type: projectStatus, timestamp: completionAt ?? Date.now() }));
    }
    this.doc.commit();
  }

  readTaskObject<T = TaskObjectSchema>(objectId: TreeID): T {
    const type: TaskObjectType = this.getTree().getNodeByID(objectId)!.data.get('type') as TaskObjectType;
    switch (type) {
      case ModelTypes.task: {
        return this.getTask(objectId) as T;
      }
      case ModelTypes.area: {
        return this.getArea(objectId) as T;
      }
      case ModelTypes.project: {
        return this.getProject(objectId) as T;
      }
      case ModelTypes.projectHeading: {
        return this.getProjectHeading(objectId) as T;
      }
    }
  }

  getRootObjectIdList(): TreeID[] {
    return this.getTree()
      .roots()
      .map((p) => p.id);
  }

  getTaskObjectList(): TaskObjectSchema[] {
    const objectList: TreeID[] = this.getTree()
      .getNodes()
      .map((p) => p.id);

    return objectList.map((o) => this.readTaskObject(o)).filter((o): o is TaskObjectSchema => o !== null);
  }

  getDateAssignedList() {
    return (this.doc.getMovableList(dateAssigned.listName).toArray() as TreeID[]).filter((item) => {
      return !this.getTree().isNodeDeleted(item);
    });
  }

  public moveDateAssignedList(item: TreeID, position: ItemMovePosition) {
    const dateAssignedList = this.doc.getMovableList(dateAssigned.listName);
    const previousIndex = dateAssignedList.toArray().indexOf(item);
    if (previousIndex === -1) {
      throw new Error('item not found');
    }

    let targetIndex = previousIndex;
    const items = dateAssignedList.toArray();
    if (position.type === 'beforeElement') {
      if (position.nextElementId === item) return;
      const beforeIndex = items.indexOf(position.nextElementId);
      if (beforeIndex === -1) throw new Error('previous element not found');
      if (beforeIndex - 1 === previousIndex) return;
      targetIndex = previousIndex < beforeIndex ? beforeIndex - 1 : beforeIndex;
    } else if (position.type === 'afterElement') {
      if (position.previousElementId === item) return;
      const afterIndex = items.indexOf(position.previousElementId);
      if (afterIndex === -1) throw new Error('next element not found');
      targetIndex = afterIndex > previousIndex ? afterIndex : afterIndex + 1;
    }
    dateAssignedList.move(previousIndex, targetIndex);
    this.doc.commit();
  }

  private getTree() {
    const tree = this.doc.getTree('todo');
    tree.enableFractionalIndex(3);
    return tree;
  }

  addReminder(data: CreateReminderSchema): string {
    const remindersMap = this.doc.getMap('reminders');
    const reminderId = nanoid();
    remindersMap.set(reminderId, data);
    this.doc.commit();
    return reminderId;
  }

  updateReminder(reminderId: string, data: UpdateReminderSchema): void {
    const remindersMap = this.doc.getMap('reminders');
    const existingReminder = remindersMap.get(reminderId) as ReminderSchema;
    if (existingReminder) {
      remindersMap.set(reminderId, { ...existingReminder, ...data });
      this.doc.commit();
    }
  }

  deleteReminder(reminderId: string): void {
    const remindersMap = this.doc.getMap('reminders');
    if (!remindersMap.get(reminderId)) {
      return;
    }
    remindersMap.delete(reminderId);
    this.doc.commit();
  }

  getReminders(): Map<TreeID, ReminderWithId[]> {
    const remindersMap = this.doc.getMap('reminders');
    const remindersData = remindersMap.toJSON() as Record<string, ReminderSchema>;
    const groupedReminders = new Map<TreeID, ReminderWithId[]>();

    Object.entries(remindersData).forEach(([reminderId, reminder]) => {
      const reminderWithId: ReminderWithId = {
        reminderId,
        itemId: reminder.itemId,
        time: reminder.time,
      };

      if (!groupedReminders.has(reminder.itemId)) {
        groupedReminders.set(reminder.itemId, []);
      }
      groupedReminders.get(reminder.itemId)!.push(reminderWithId);
    });

    return groupedReminders;
  }

  private updateTaskStatus(taskId: TreeID, status: ItemStatus, completionAt?: number) {
    const { map, parentId } = this.getTreeNode<TaskLoroSchema>(taskId, ModelTypes.task);
    if (status) {
      switch (status) {
        case ItemStatusEnum.created: {
          if (map.get(ModelKeys.completion)) {
            const completion = JSON.parse(map.get(ModelKeys.completion) as string);
            map.set(ModelKeys.completion, JSON.stringify({ type: 'created', timestamp: completion.timestamp }));
          }
          if (parentId) {
            this.resetNearestProjectToCreated(parentId);
          }
          break;
        }
        case ItemStatusEnum.completed: {
          map.set(ModelKeys.completion, JSON.stringify({ type: 'completed', timestamp: completionAt ?? Date.now() }));
          const newTask = createRecurringTask(map, completionAt);
          if (newTask) {
            this.addTask(newTask);
          }
          break;
        }
        case ItemStatusEnum.canceled: {
          map.set(ModelKeys.completion, JSON.stringify({ type: 'canceled', timestamp: completionAt ?? Date.now() }));
          const newTask = createRecurringTask(map, completionAt);
          if (newTask) {
            this.addTask(newTask);
          }
          break;
        }
        default:
          throw new Error('invalid status');
      }
    }
  }

  private checkParentType(type: string, parentId?: TreeID) {
    const allowedParentsTypes = ParentRules[type];
    let parentType: string | undefined = ModelTypes.root;
    if (parentId) {
      const parentNode = this.getTree().getNodeByID(parentId);
      if (!parentNode) {
        throw new Error('parent node not found');
      }
      parentType = parentNode.data.get(ModelKeys.type) as string;
    }
    if (!allowedParentsTypes.includes(parentType)) {
      throw new Error(`invalid parent type: ${parentType} for ${type}`);
    }
  }

  private getTreeNodeById(id: TreeID) {
    const node = this.getTree().getNodeByID(id);
    if (!node) {
      throw new Error('node not found');
    }
    return node;
  }

  private getArea(id: TreeID): AreaSchema {
    const { map, children } = this.getTreeNode<ToLoro<AreaSchema>>(id, ModelTypes.area);
    return {
      id,
      uid: map.get(ModelKeys.uid),
      type: ModelTypes.area,
      title: map.get(ModelKeys.title),
      children: children,
      createdAt: map.get(ModelKeys.createdAt) as number,
      tags: map.get(ModelKeys.tags).toArray(),
    };
  }

  private getProject(id: TreeID): ProjectSchema {
    const { map, children, parentId } = this.getTreeNode<ProjectLoroSchema>(id, ModelTypes.project);
    let status: ItemStatus = 'created';
    const completion = map.get('completion');
    let completionAt: TaskSchema['completionAt'];
    if (completion) {
      status = JSON.parse(completion).type;
      completionAt = JSON.parse(completion).timestamp;
    }

    return {
      id,
      status,
      uid: map.get(ModelKeys.uid),
      completionAt,
      type: ModelTypes.project,
      title: map.get(ModelKeys.title),
      notes: map.get(ModelKeys.notes),
      parentId,
      startDate: map.get(ModelKeys.startDate),
      dueDate: map.get(ModelKeys.dueDate),
      createdAt: map.get(ModelKeys.createdAt),
      tags: map.get(ModelKeys.tags).toArray(),
      children,
    };
  }

  private getProjectHeading(id: TreeID): ProjectHeadingSchema {
    const { map, children, parentId } = this.getTreeNode<ToLoro<ProjectHeadingSchema>>(id, ModelTypes.projectHeading);
    return {
      id,
      parentId: parentId!,
      uid: map.get(ModelKeys.uid),
      type: ModelTypes.projectHeading,
      title: map.get(ModelKeys.title),
      isArchived: !!map.get(ModelKeys.archivedDate),
      archivedDate: map.get(ModelKeys.archivedDate),
      children: children,
    };
  }

  private getTask(id: TreeID): TaskSchema {
    const { map, node } = this.getTreeNode<TaskLoroSchema>(id, ModelTypes.task);
    let status: ItemStatus = 'created';
    const completion = map.get('completion');
    let completionAt: TaskSchema['completionAt'];
    if (completion) {
      status = JSON.parse(completion).type;
      completionAt = JSON.parse(completion).timestamp;
    }
    const recurringRuleStr = map.get(ModelKeys.recurringRule);
    const res: TaskSchema = {
      id,
      uid: map.get(ModelKeys.uid),
      type: ModelTypes.task,
      title: map.get(ModelKeys.title),
      notes: map.get(ModelKeys.notes),
      completionAt,
      status,
      parentId: node.parent()?.id,
      children: (node.children() ?? []).map((p) => p.id),
      tags: map.get(ModelKeys.tags).toArray().sort(),
      createdAt: map.get(ModelKeys.createdAt),
      startDate: map.get(ModelKeys.startDate),
      dueDate: map.get(ModelKeys.dueDate),
      recurringRule: recurringRuleStr ? JSON.parse(recurringRuleStr as string) : undefined,
    };
    return res as TaskSchema;
  }

  private getTreeNode<T extends Record<string, unknown>>(id: TreeID, type: string) {
    const node = this.getTree().getNodeByID(id);
    if (!node || node.data.get(ModelKeys.type) !== type) {
      throw new Error(type + 'not found');
    }
    return {
      node,
      map: node.data as unknown as LoroMap<T>,
      children: (node.children() ?? []).map((p) => p.id),
      parentId: node.parent()?.id,
    };
  }

  private resetNearestProjectToCreated(parentId: TreeID) {
    const parentNode = this.getTree().getNodeByID(parentId);
    if (!parentNode) return;

    const parentType = parentNode.data.get(ModelKeys.type) as string;

    if (parentType === ModelTypes.project) {
      const projectMap = parentNode.data as unknown as LoroMap<ProjectLoroSchema>;
      if (projectMap.get(ModelKeys.completion)) {
        const completion = JSON.parse(projectMap.get(ModelKeys.completion) as string);
        projectMap.set(ModelKeys.completion, JSON.stringify({ type: 'created', timestamp: completion.timestamp }));
      }
    } else if (parentType === ModelTypes.projectHeading) {
      const headingParentId = parentNode.parent()?.id;
      if (headingParentId) {
        this.resetNearestProjectToCreated(headingParentId);
      }
    }
  }

  private createNodeInPosition(type: string, position: ItemPosition) {
    let node: LoroTreeNode;
    switch (position.type) {
      case 'firstElement': {
        this.checkParentType(type, position.parentId);
        node = this.getTree().createNode(position.parentId, 0);
        break;
      }
      case 'afterElement': {
        const previousElement = this.getTreeNodeById(position.previousElementId);
        this.checkParentType(type, previousElement.parent()?.id);
        const index = previousElement.index() ?? 0;
        node = this.getTree().createNode(previousElement.parent()?.id, index + 1);
        break;
      }
      case 'beforeElement': {
        const nextElement = this.getTreeNodeById(position.nextElementId);
        this.checkParentType(type, nextElement.parent()?.id);
        const index = nextElement.index() ?? 0;
        node = this.getTree().createNode(nextElement.parent()?.id, index);
        break;
      }
      default:
        throw new Error('invalid position type');
    }
    node.data.set('type', type);
    node.data.set('uid', nanoid(12));
    return node;
  }

  private moveNode(nodeId: TreeID, positon: ItemPosition) {
    switch (positon.type) {
      case 'firstElement':
        this.getTree()
          .getNodeByID(nodeId)!
          .move(positon.parentId ? this.getTree().getNodeByID(positon.parentId) : undefined, 0);
        break;
      case 'afterElement':
        this.getTree().getNodeByID(nodeId)!.moveAfter(this.getTree().getNodeByID(positon.previousElementId)!);
        break;
      case 'beforeElement': {
        const nextElement = this.getTree().getNodeByID(positon.nextElementId)!;
        this.getTree().getNodeByID(nodeId)!.moveBefore(nextElement);
        break;
      }
    }
  }

  private handleFilterConditions<T>(
    payload: T,
    itemId: TreeID,
    criteriaFn: (condition: FilterCondition, payload: T) => boolean
  ) {
    filterConditions.forEach((condition) => {
      if (criteriaFn(condition, payload)) {
        this.addToFilterList(itemId, condition.listName);
      }
    });
  }

  private handleCreateTask(payload: CreateTaskSchema, itemId: TreeID) {
    const { parentId } = this.getTreeNode<TaskLoroSchema>(itemId, ModelTypes.task);
    if (parentId) {
      this.resetNearestProjectToCreated(parentId);
    }
    this.handleFilterConditions(payload, itemId, (condition, payload) => condition.meetTaskCreationCriteria(payload));
  }

  private handleUpdateTask(payload: UpdateTaskSchema, itemId: TreeID) {
    this.handleFilterConditions(payload, itemId, (condition, payload) => condition.meetTaskUpdateCriteria(payload));
  }

  private handleUpdateProject(payload: UpdateProjectSchema, itemId: TreeID) {
    this.handleFilterConditions(payload, itemId, (condition, payload) => condition.meetProjectUpdateCriteria(payload));
  }

  private addToFilterList(itemId: TreeID, listName: string) {
    const list = this.doc.getMovableList(listName);
    const index = list.toArray().indexOf(itemId);
    if (index === -1) {
      list.insert(0, itemId);
    } else {
      list.move(list.length - 1, 0);
    }
    this.doc.commit();
  }

  public covertToProject(itemId: TreeID) {
    const targetNode = this.getTree().getNodeByID(itemId);
    if (!targetNode) {
      throw new Error('node not found');
    }
    const type = targetNode.data.get(ModelKeys.type) as string;
    if (type !== ModelTypes.projectHeading && type !== ModelTypes.task) {
      throw new Error('invalid type');
    }
    targetNode.data.set(ModelKeys.type, ModelTypes.project);
    this.moveNode(itemId, { type: 'firstElement' });
    const childrenList = targetNode.children();
    if (childrenList && childrenList.length > 0) {
      const hasIncompleteChildren = childrenList.some((child) => {
        return !child.data.get(ModelKeys.completion);
      });
      if (hasIncompleteChildren) {
        targetNode.data.delete(ModelKeys.completion);
      }
    }
    this.doc.commit();
  }

  toJSON(): ITaskModelData {
    const taskList = this.getTaskObjectList();
    const taskObjectMap = new Map<string, TaskObjectSchema>();
    taskList.map((task) => {
      taskObjectMap.set(task.id, task);
    });
    const taskObjectUidMap = new Map<string, TaskObjectSchema>();
    taskList.map((task) => {
      taskObjectUidMap.set(task.uid, task);
    });
    const rootObjectIdList = this.getRootObjectIdList();
    const dateAssignedList = this.getDateAssignedList();

    const versions: Record<PeerID, number> = {};
    this.doc
      .version()
      .toJSON()
      .forEach((version, peerId) => {
        versions[peerId] = version;
      });
    const remindersMap = this.getReminders();
    return {
      taskObjectUidMap,
      version: versions,
      taskList,
      taskObjectMap,
      rootObjectIdList,
      dateAssignedList,
      remindersMap,
    };
  }

  fixState() {
    const { invalidStatusProjects } = getInvalidTaskData(this.toJSON());
    invalidStatusProjects.forEach((projectId) => {
      this.transitionProjectState({
        projectId,
        projectStatus: 'created',
      });
    });
  }
}
