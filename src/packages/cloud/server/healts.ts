import { HBServerClient } from '../client';

interface HealthResponse {
  sha: string;
  time: number;
}

export class Health {
  constructor(private client: HBServerClient) {}

  async ready(): Promise<HealthResponse> {
    return this.client.get<HealthResponse>('health/v1/ready');
  }
}
