import mongoose, { Schema, Document, Model } from 'mongoose'
import { UserRole, DesignerStatus, IAddress } from '@/types'

export interface IUser extends Document {
  email: string
  password?: string
  name: string
  role: UserRole
  // Designer
  status: DesignerStatus
  username?: string
  storeName?: string
  bio?: string
  avatar?: string
  socialLinks?: { instagram?: string; website?: string }
  commissionRate: number
  stripeAccountId?: string
  // Customer
  addresses: IAddress[]
  wishlist: mongoose.Types.ObjectId[]
  // Password reset
  resetToken?: string
  resetTokenExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<IAddress>({
  label: String,
  street: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
})

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['customer', 'designer', 'admin'], default: 'customer' },
    // Designer fields
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    storeName: String,
    bio: String,
    avatar: String,
    socialLinks: {
      instagram: String,
      website: String,
    },
    commissionRate: { type: Number, default: 15 },
    stripeAccountId: String,
    // Customer fields
    addresses: [AddressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    // Password reset (stored as sha256 hash of the raw token)
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
  },
  { timestamps: true }
)

const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
export default User
