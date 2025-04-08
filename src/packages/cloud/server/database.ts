import { HBServerClient } from '../client';

export interface ListDatabaseRequest {
  application_name: string;
}

export interface DatabaseItem {
  database_id: string;
  database_name: string;
  database_salt: string;
  created_at: string;
  last_modified: number;
  usage: number;
}

export interface CreateDatabaseRequest {
  application_name: 'tasks';
  database_name: string;
  database_salt: string;
  database_access_key: string;
}

export interface DeleteDatabaseRequest {
  database_id: string;
  database_access_key: string;
  database_salt: string;
}

export interface GetDatabaseChangesRequest {
  database_id: string;
  database_access_key: string;
  database_salt: string;
  from_version: string | null;
}

export interface SaveDatabaseChangeRequest {
  database_id: string;
  database_access_key: string;
  database_salt: string;
  from_version: string | null;
  to_version: string;
  content: string;
}

export interface VersionState {
  from?: string;
  to: string;
  content: string;
}

export interface GetDatabaseChangesResponse {
  baseVersion: string | null;
  baseContent: string | null;
  clients: Record<string, VersionState>;
}

export class Database {
  constructor(private client: HBServerClient) {}

  /**
   * 列出数据库列表
   */
  async listDatabases(applicationName: string): Promise<DatabaseItem[]> {
    return this.client.post<DatabaseItem[]>('database/v1/database/list', {
      application_name: applicationName,
    });
  }

  /**
   * 创建数据库
   */
  async createDatabase(request: CreateDatabaseRequest): Promise<string> {
    return this.client.post<string>('database/v1/database/create', request);
  }

  /**
   * 删除数据库
   */
  async deleteDatabase(request: DeleteDatabaseRequest): Promise<void> {
    return this.client.post<void>('database/v1/database/delete', request);
  }

  /**
   * 获取数据库变更
   *
   * @param request 包含数据库ID、访问凭证和向量时钟
   */
  async getDatabaseChanges(request: GetDatabaseChangesRequest): Promise<GetDatabaseChangesResponse> {
    return this.client.post<GetDatabaseChangesResponse>('database/v1/database/changes/get', request);
  }

  /**
   * 保存数据库变更
   *
   * @param request 包含数据库ID、访问凭证、变更内容和向量时钟
   */
  async saveDatabaseChange(request: SaveDatabaseChangeRequest): Promise<boolean> {
    return this.client.post<boolean>('database/v1/database/changes/save', request);
  }
}
