import { orderEndpoints } from '@/config/apiEndpoints';
import { apiRequest, JSON_HEADERS } from '@/services/http';
import type { ApiResult } from '@/services/http';
import type { CartItem, Order } from '@/types';

export interface OrderListResponse {
  totalInQueue?: number;
  orders?: Order[];
  error?: string;
}

export interface OrderResponse {
  order?: Order;
  stockUpdates?: Array<{ id: string; stock: number }>;
  error?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  customerMobile?: string;
  items: CartItem[];
  totalAmount: number;
  userId?: string;
}

export const orderService = {
  /** Order queue (`GET /api/orders`). */
  list: (): Promise<ApiResult<OrderListResponse>> =>
    apiRequest<OrderListResponse>(orderEndpoints.base),

  /** Place an order and reserve stock (`POST /api/orders`). */
  create: (payload: CreateOrderPayload): Promise<ApiResult<OrderResponse>> =>
    apiRequest<OrderResponse>(orderEndpoints.base, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    }),

  /** Fulfilment status update (`PATCH /api/orders`). */
  updateStatus: (
    orderId: string,
    status: Order['status']
  ): Promise<ApiResult<OrderResponse>> =>
    apiRequest<OrderResponse>(orderEndpoints.base, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({ id: orderId, status }),
    }),
};
