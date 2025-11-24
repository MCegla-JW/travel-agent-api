import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
})

const tripSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String },
  destination: { type: String, required: true },
  country: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  activities: [activitySchema],
})

const Trip = mongoose.model('Trip', tripSchema)

export default Trip
