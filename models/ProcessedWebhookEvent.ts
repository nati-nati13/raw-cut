import mongoose, { Schema, Model } from 'mongoose'

const ProcessedWebhookEventSchema = new Schema({
  stripeEventId: { type: String, required: true, unique: true },
  processedAt: { type: Date, default: Date.now },
})

const ProcessedWebhookEvent: Model<any> =
  mongoose.models.ProcessedWebhookEvent ??
  mongoose.model('ProcessedWebhookEvent', ProcessedWebhookEventSchema)

export default ProcessedWebhookEvent
