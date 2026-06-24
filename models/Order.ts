import mongoose, { Schema, Document, Model } from 'mongoose'
import { OrderStatus, IOrderItem, IAddress } from '@/types'

export interface IOrder extends Document {
  orderNumber: string
  customer: mongoose.Types.ObjectId
  items: IOrderItem[]
  status: OrderStatus
  shippingAddress: IAddress
  shippingCarrier: string
  shippingCost: number
  trackingNumber?: string
  subtotal: number
  platformFee: number
  designerEarnings: number
  totalAmount: number
  paymentIntentId: string
  currency: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  designer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  variant: {
    size: String,
    color: String,
  },
  type: { type: String, enum: ['physical', 'digital'], required: true },
})

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    shippingAddress: {
      street: String,
      city: String,
      country: String,
      postalCode: String,
    },
    shippingCarrier: String,
    shippingCost: { type: Number, default: 0 },
    trackingNumber: String,
    subtotal: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    designerEarnings: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentIntentId: { type: String, required: true, unique: true },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
)

const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>('Order', OrderSchema)
export default Order
