import { HBServerClient } from '../client';

// ----- Token mgmt -----

export interface CreateTaskTokenRequest {
  database_id: string;
  database_access_key: string;
  database_salt: string;
  name: string;
}

export interface CreateTaskTokenResponse {
  id: string;
  database_id: string;
  token: string;
  name: string;
}

export interface TaskTokenItem {
  id: string;
  database_id: string;
  name: string;
  token: string;
  created_at: string;
  last_used_at: string | null;
}

export interface RevokeTaskTokenRequest {
  id: string;
}

// ----- Inbox -----

export interface InboxAppendRequest {
  title: string;
  notes?: string | null;
  due_date?: number | null;
}

export interface InboxAppendResponse {
  id: string;
  deduped: boolean;
}

export interface InboxItemPayload {
  id: string;
  title: string;
  notes: string | null;
  due_date: number | null;
}

export interface InboxClaimResponse {
  items: InboxItemPayload[];
}

export interface InboxCommitRequest {
  item_ids: string[];
}

export interface InboxCommitResponse {
  committed: string[];
}

export class TasksToken {
  constructor(private client: HBServerClient) {}

  async create(request: CreateTaskTokenRequest): Promise<CreateTaskTokenResponse> {
    return this.client.post<CreateTaskTokenResponse>('tasks/token/v1/create', request);
  }

  async list(): Promise<TaskTokenItem[]> {
    return this.client.post<TaskTokenItem[]>('tasks/token/v1/list', {});
  }

  async revoke(request: RevokeTaskTokenRequest): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('tasks/token/v1/revoke', request);
  }
}

export class TasksInbox {
  constructor(private client: HBServerClient) {}

  async append(token: string, request: InboxAppendRequest): Promise<InboxAppendResponse> {
    return this.client.bearerPost<InboxAppendResponse>(token, 'tasks/inbox/v1/append', request);
  }

  async claim(token: string): Promise<InboxClaimResponse> {
    return this.client.bearerPost<InboxClaimResponse>(token, 'tasks/inbox/v1/claim', {});
  }

  async commit(token: string, request: InboxCommitRequest): Promise<InboxCommitResponse> {
    return this.client.bearerPost<InboxCommitResponse>(token, 'tasks/inbox/v1/commit', request);
  }
}
