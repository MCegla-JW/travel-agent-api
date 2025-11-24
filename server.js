import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'

// Middlware
import morgan from 'morgan'
import cors from 'cors'
import errorHandler from './middleware/errorHandler.js'

const app = express()

// * Routers
import authController from './controllers/auth.js'
import tripController from './controllers/trip.js'

// Middleware
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

// * Routes
app.use('/auth', authController)
app.use('/trips', tripController)

// * Handle all errors thrown in the routes
app.use(errorHandler)

// Connections
const connect = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Database connection established!')
  } catch (error) {
    console.error('Unable to connect')
  }
}

connect()

app.listen(3000, () => {
  console.log('Connection to server established!')
})
