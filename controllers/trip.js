import express from 'express'
// import isSignedIn from '../middleware/isSignedIn.js'
import Trip from '../models/trip.js'
import { NotFound, Forbidden } from '../utils/erros.js'

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
router.post('/' /*, isSignedin */, async (req, res, next) => {
  try {
    // req.body.owner = req.user._id
    const trip = await Trip.create(req.body)
    res.status(201).json(trip)
  } catch (error) {
    next(error)
  }
})

// * Show
router.get('/:tripId' /*, isSignedin*/, async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId) // Decided to not populate owner but keep the user ID
    if (!trip) throw new NotFound()
    res.status(200).json(trip)
  } catch (error) {
    next(error)
  }
})

// * Update
router.put('/:tripId' /*, isSignedIn */, async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound()
    // if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    const updatedTrip = await Trip.findByIdAndUpdate(tripId, req.body, {
      returnDocument: 'after',
    })
    res.status(200).json(updatedTrip)
  } catch (error) {
    next(error)
  }
})

// * Delete
router.delete('/:tripId' /*, isSignedin */, async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound()
    // if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    await Trip.findByIdAndDelete(tripId)
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})

/* Activities -------------------------------------------------------------- */

// * Index
router.get('/:tripId/activities/' /*, isSignedIn */, async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound()
    res.status(200).json(trip.activities)
  } catch (error) {
    next(error)
  }
})

// * Create
router.post(
  '/:tripId/activities/' /*, isSignedIn */,
  async (req, res, next) => {
    try {
      const { tripId } = req.params
      const trip = await Trip.findById(tripId)
      if (!trip) throw new NotFound()
      // req.body.owner = req.user._id
      trip.activities.push(req.body)
      await trip.save()
      res.status(201).json(trip.activities)
    } catch (error) {
      next(error)
    }
  },
)

// * Show
router.get(
  '/:tripId/activities/:actId' /*, isSignedIn */,
  async (req, res, next) => {
    try {
      const { tripId, actId } = req.params
      const trip = await Trip.findById(tripId)
      if (!trip) throw new NotFound()
      const activity = trip.activities.id(actId)
      if (!activity) throw new NotFound()
      res.status(200).json(activity)
    } catch (error) {
      next(error)
    }
  },
)

// * Update
router.put(
  '/:tripId/activities/:actId' /*, isSignedIn */,
  async (req, res, next) => {
    try {
      const { tripId, actId } = req.params
      const trip = await Trip.findById(tripId)
      if (!trip) throw new NotFound()
      // if (!trip.owner.equals(req.user._id)) throw new Forbidden()
      const activity = trip.activities.id(actId)
      if (!activity) throw new NotFound()
      activity.set(req.body)
      await trip.save()
      res.status(200).json(activity)
    } catch (error) {
      next(error)
    }
  },
)

// * Delete
router.delete(
  '/:tripId/activities/:actId' /*, isSignedIn */,
  async (req, res, next) => {
    try {
      const { tripId, actId } = req.params
      const trip = await Trip.findById(tripId)
      if (!trip) throw new NotFound()
      // if (!trip.owner.equals(req.user._id)) throw new Forbidden()
      const activity = trip.activities.id(actId)
      if (!activity) throw new NotFound()
      activity.deleteOne()
      await trip.save()
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  },
)

/* Export ------------------------------------------------------------------ */

export default router
