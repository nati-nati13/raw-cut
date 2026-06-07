export type UserRole = 'customer' | 'designer' | 'admin'
export type DesignerStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type ProductStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived'
export type ProductType = 'physical' | 'digital'
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface IAddress {
  label?: string
  street: string
  city: string
  country: string
  postalCode: string
  isDefault?: boolean
}

export interface IVariant {
  size?: string
  color?: string
  stock: number
  sku: string
}

export interface IDimensions {
  length: number
  width: number
  height: number
}

export interface IShippingRate {
  carrier: string
  cost: number
  estimatedDays: string
  logo?: string
}

export interface IOrderItem {
  product: any
  designer: any
  quantity: number
  price: number
  variant?: { size?: string; color?: string }
  type: ProductType
}

export interface CartItem {
  productId: string
  slug: string
  title: string
  price: number
  image: string
  quantity: number
  variant?: { size?: string; color?: string }
  type: ProductType
  designerId: string
  designerName: string
  weight?: number
}
