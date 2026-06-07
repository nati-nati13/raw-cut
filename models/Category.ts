import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICategory extends Document {
  name: string
  slug: string
  parent?: mongoose.Types.ObjectId
  image?: string
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  image: String,
})

const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>('Category', CategorySchema)
export default Category
