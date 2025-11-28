import mongoose from 'mongoose'
import z from 'zod'
import { sanitizeAndNormalizeUrl } from '../utils/urlSanitizer.js'

// * Mongoose schema and model for use with MongoDB ---------------------------

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  mapUrl: {
    type: String,
    set: (value) => {
      if (!value || value === 'null') return undefined
      return sanitizeAndNormalizeUrl(value)
    },
  },
  startDate: { type: Date },
  endDate: {
    type: Date,
    validate: {
      validator: function (value) {
        if (!value || !this.startDate) return true
        return this.startDate < value
      },
      message: 'End date must be after start date',
    },
  },
})

const tripSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  startDate: { type: Date },
  endDate: {
    type: Date,
    validate: {
      validator: function (value) {
        if (!value || !this.startDate) return true
        return this.startDate < value
      },
      message: 'End date must be after start date',
    },
  },
  activities: [activitySchema],
})

const Trip = mongoose.model('Trip', tripSchema)

export default Trip

// * Zod schema (derived from above) for use with OpenaAI ---------------------

export const activitySchemaZod = z.object({
  title: z.string(),
  description: z.string(),
  location: z.string(),
  mapUrl: z.string().describe('A valid URL'),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
})

export const tripSchemaZod = z.object({
  title: z.string(),
  description: z.string(),
  location: z.string(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  activities: z.array(activitySchemaZod),
})
