import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'

// Middlware
import morgan from 'morgan'
import cors from 'cors'

const app = express()

app.get('/', (req, res) => {
  console.log('Travel Agent')
})

// Middleware
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

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
