import { HBServerClient } from '../client';

export interface RegisterRequest {
  account: string;
  password: string;
}

export interface RegisterResponse {
  session: string;
  accountId: string;
}

export interface LoginResponse {
  session: string;
}

export interface GetAccountResponse {
  account: string;
  expiresAt: number;
  accountId: string;
}

export interface AddPaymentOrderRequest {
  email: string;
  orderId: string;
}

export interface AddPaymentOrderResponse {
  success: boolean;
}

export class Account {
  constructor(private client: HBServerClient) {}

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return this.client.post<RegisterResponse>('account/v1/account', request);
  }

  async login(request: RegisterRequest): Promise<LoginResponse> {
    return this.client.post<RegisterResponse>('account/v1/account/login', request);
  }

  async logout(): Promise<void> {
    return this.client.post<void>('account/v1/account/logout');
  }

  async delete(): Promise<void> {
    return this.client.delete<void>('account/v1/account');
  }

  async getAccount(): Promise<GetAccountResponse> {
    return this.client.get<GetAccountResponse>('account/v1/account');
  }

  async addPaymentOrder(request: AddPaymentOrderRequest): Promise<AddPaymentOrderResponse> {
    return this.client.post<AddPaymentOrderResponse>('account/v1/payment/order', request);
  }

  async checkAndInsertPurchaseHistory(): Promise<void> {
    return this.client.post<void>('account/v1/payment/history');
  }
}
