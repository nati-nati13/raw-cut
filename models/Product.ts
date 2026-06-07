import mongoose, { Schema, Document, Model } from 'mongoose'
import { ProductStatus, ProductType, IVariant, IDimensions } from '@/types'

export interface IProduct extends Document {
  slug: string
  title: string
  description: string
  aiDescription?: string
  price: number
  currency: string
  designer: mongoose.Types.ObjectId
  category: mongoose.Types.ObjectId
  type: ProductType
  images: string[]
  digitalFileUrl?: string
  variants: IVariant[]
  weight?: number
  dimensions?: IDimensions
  tags: string[]
  status: ProductStatus
  featured: boolean
  views: number
  soldCount: number
  createdAt: Date
  updatedAt: Date
}

const VariantSchema = new Schema<IVariant>({
  size: String,
  color: String,
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true },
})

const ProductSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    aiDescription: String,
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    designer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    type: { type: String, enum: ['physical', 'digital'], required: true },
    images: [String],
    digitalFileUrl: String,
    variants: [VariantSchema],
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    tags: [String],
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'published', 'rejected', 'archived'],
      default: 'draft',
    },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

ProductSchema.index({ status: 1, featured: -1 })
ProductSchema.index({ designer: 1 })
ProductSchema.index({ category: 1 })
ProductSchema.index({ tags: 1 })
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' })

const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>('Product', ProductSchema)
export default Product
