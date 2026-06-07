import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/rawcut'

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  parent: { type: mongoose.Schema.Types.ObjectId, default: null },
  image: String,
})

const Category = mongoose.models.Category ?? mongoose.model('Category', CategorySchema)

const categories = [
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Bags', slug: 'bags' },
  { name: 'Jewellery', slug: 'jewellery' },
  { name: 'Home & Living', slug: 'home-living' },
  { name: 'Digital', slug: 'digital' },
  { name: 'Art', slug: 'art' },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  await Category.deleteMany({})
  await Category.insertMany(categories)
  console.log('Categories seeded:', categories.map((c) => c.name).join(', '))
  await mongoose.disconnect()
}

seed().catch(console.error)
