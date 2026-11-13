import mongoose, { Schema, Document, Model } from 'mongoose';
import { CartItem, OrderStatus } from '@/types';

export interface IOrder extends Document {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  orderDate?: string;
  queuePosition: number;
  userId?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    id:              { type: String, required: true, unique: true },
    customerName:    { type: String, required: true },
    customerEmail:   { type: String, default: 'customer@example.com' },
    shippingAddress: { type: String, default: 'Standard Delivery' },
    items:           { type: Schema.Types.Mixed, required: true },
    totalAmount:     { type: Number, required: true },
    status:          { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    createdAt:       { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    orderDate:       { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) },
    queuePosition:   { type: Number, default: 1 },
    userId:          { type: String },
  },
  { timestamps: true }
);

const OrderModel: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>('Order', OrderSchema);

export default OrderModel;
