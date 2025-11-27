import mongoose from 'mongoose'
import { sanitizeAndNormalizeUrl } from '../utils/urlSanitizer.js'

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
        return !value || value <= this.startDate
      },
      message: 'End date must not be after start date',
    },
  },
  websiteUrl: {
    type: String,
    set: (value) => {
      if (!value || value === 'null') return undefined
      return sanitizeAndNormalizeUrl(value)
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
        return !value || value <= this.startDate
      },
      message: 'End date must not be after start date',
    },
  },
  activities: [activitySchema],
})

const Trip = mongoose.model('Trip', tripSchema)

export default Trip
