import express from 'express'
import isSignedIn from '../middleware/isSignedIn.js'
import Trip from '../models/trip.js'
import { NotFound, Forbidden } from '../utils/errors'

const router = express.Router()

/* Trips ------------------------------------------------------------------- */

// * Index
router.get('/', async (req, res, next) => {
  try {
    const trips = await Trip.find() // Decided to not populate owner but keep the user ID
    res.status(200).json(trips)
  } catch (error) {
    next(error)
  }
})

// * Create
router.post('/', isSignedin, async (req, res, next) => {
  try {
    req.body.owner = req.user._id
    const trip = await Trip.create(req.body)
    res.status(201).json(trip)
  } catch (error) {
    next(error)
  }
})

// * Show
router.get('/:tripId', isSignedin, async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId) // Decided to not populate owner but keep the user ID
    if (!trip) throw new NotFound
    res.status(200).json(trip)
  } catch (error) {
    next(error)
  }
})

// * Update
router.put('/:tripId', async (req, res, next) => {
  try {
    const {tripId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound
    if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      req.body,
      { returnDocument: 'after' },
    )
    res.status(200).json(updatedTrip)
  } catch (error) {
    next(error)
  }
})

// * Delete
router.delete('/:tripId', async (req, res, next) => {
  try {
    const {tripId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound
    if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    await Trip.findByIdAndDelete(resourceId)
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})

/* Activities -------------------------------------------------------------- */

// * Index
router.get('/:tripId/activities/', async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId) // Decided to not populate owner but keep the user ID
    if (!trip) throw new NotFound
    res.status(200).json(trip.activities)
  } catch (error) {
    next(error)
  }
})

// * Create
router.post('/:tripId/activities/', async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

// * Show
router.get('/:tripId/activities/:actId', async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

// * Update
router.put('/:tripId/activities/:actId', async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

// * Delete
router.delete('/:tripId/activities/:actId', async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

/* Export ------------------------------------------------------------------ */

export default router
