import { LocalServerClient } from '../client';

export interface ListRequest {
  folder: string;
}

export interface ListResponse {
  files: string[];
}

export interface DeleteRequest {
  folder: string;
  key: string;
}

export interface DeleteResponse {
  success: boolean;
}

export interface ReadRequest {
  folder: string;
  key: string;
}

export interface ReadResponse {
  data: string;
}

export interface SaveRequest {
  folder: string;
  data: unknown;
}

export interface SaveResponse {
  success: boolean;
  key: string;
}

export class Cloud {
  constructor(private client: LocalServerClient) {}

  /**
   * List files in a folder
   */
  async list(request: ListRequest): Promise<ListResponse> {
    return this.client.post<ListResponse>('v1/cloud/list', request);
  }

  /**
   * Delete a file
   */
  async delete(request: DeleteRequest): Promise<DeleteResponse> {
    return this.client.post<DeleteResponse>('v1/cloud/delete', request);
  }

  /**
   * Read a file
   */
  async read(request: ReadRequest): Promise<ReadResponse> {
    return this.client.post<ReadResponse>('v1/cloud/read', request);
  }

  /**
   * Save data to a file
   */
  async save(request: SaveRequest): Promise<SaveResponse> {
    return this.client.post<SaveResponse>('v1/cloud/save', request);
  }
}
