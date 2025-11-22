// src/types/cart.d.ts

export interface CartItem {
  id: string;
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  imagen?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  totalItems: number;
}

export interface PaymentRequest {
  cartId: string;
  paymentMethod: "stripe" | "paypal";
  amount: number;
  currency: string;
  customerEmail: string;
  metadata: {
    orderDescription: string;
  };
}

export interface PaymentResponse {
  paymentId: string;
  status: "pending" | "completed" | "failed";
  gatewayUrl?: string;
  clientSecret?: string;
}
