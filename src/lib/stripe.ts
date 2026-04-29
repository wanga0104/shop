import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
}

export interface CartItem {
  id: string;
  sessionId: string;
  productId: string;
  quantity: number;
  product: Product;
  createdAt: Date;
}

export interface Order {
  id: string;
  sessionId: string;
  customerEmail: string;
  customerName: string;
  total: number;
  status: string;
  stripePaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}