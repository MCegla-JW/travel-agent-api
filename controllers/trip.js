import express from 'express'
import OpenAI from 'openai'

import isSignedIn from '../middleware/isSignedIn.js'
import Trip, { tripSchemaZod } from '../models/trip.js'

import { NotFound, Forbidden } from '../utils/erros.js'
import { zodTextFormat } from 'openai/helpers/zod.mjs'

const router = express.Router()

/* Trips ------------------------------------------------------------------- */

// * Index
router.get('/', isSignedIn, async (req, res, next) => {
  try {
    const trips = await Trip.find({ owner: req.user._id })
    res.status(200).json(trips)
  } catch (error) {
    next(error)
  }
})

// * Create
router.post('/', isSignedIn, async (req, res, next) => {
  try {
    req.body.owner = req.user._id
    const trip = await Trip.create(req.body)
    res.status(201).json(trip)
  } catch (error) {
    next(error)
  }
})

// * Show
router.get('/:tripId', isSignedIn, async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound()
    if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    res.status(200).json(trip)
  } catch (error) {
    next(error)
  }
})

// * Update
router.put('/:tripId', isSignedIn, async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound()
    if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    const updatedTrip = await Trip.findByIdAndUpdate(tripId, req.body, {
      returnDocument: 'after',
    })
    res.status(200).json(updatedTrip)
  } catch (error) {
    next(error)
  }
})

// * Delete
router.delete('/:tripId', isSignedIn, async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound()
    if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    await Trip.findByIdAndDelete(tripId)
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})

/* Activities -------------------------------------------------------------- */

// * Index
router.get('/:tripId/activities/', isSignedIn, async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound()
    if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    res.status(200).json(trip.activities)
  } catch (error) {
    next(error)
  }
})

// * Create
router.post('/:tripId/activities/', isSignedIn, async (req, res, next) => {
  try {
    const { tripId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound()
    if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    // req.body.owner = req.user._id
    trip.activities.push(req.body)
    await trip.save()
    res.status(201).json(trip.activities)
  } catch (error) {
    next(error)
  }
})

// * Propose
router.get(
  '/:tripId/activities/propose',
  isSignedIn,
  async (req, res, next) => {
    try {
      const { tripId } = req.params

      const trip = await Trip.findById(tripId)
      if (!trip) throw new NotFound()
      if (!trip.owner.equals(req.user._id)) throw new Forbidden()

      const openai = new OpenAI()
      const prompt = [
        {
          // Specify background and behaviour
          role: 'developer',
          content: `You are a travel expert.
          You know every spot on Earth as if you had lived there for a decade.
          You know local customs, local food, local sights to see: the hidden gems and the mandatory sites.`,
        },
        {
          // Specify tonality of responses
          role: 'developer',
          content: `Your tone is crisp, clear, and concise.
          It always contains a sparkle of inspiration and colour.`,
        },
        {
          // Avoid hallucination when it comes to URLs
          role: 'developer',
          content: `Where a link is required, you always provide valid URLs that are known to work. Do not imagine something; prefer null if you are unsure`,
        },
        {
          // Give an example for the specifuc map ULR value
          role: 'developer',
          content: `If you need to provide a map URL, create a Google Map query URL like https://www.google.com/maps/search/?api=1&query=Fushimi+Inari+Taisha`,
        },
        {
          // Safe guard against misuse
          role: 'developer',
          content: `If the user asks for something outside of travel suggestions and activities, respond with an error.`,
        },
        {
          // Use existing user input to guide the proposals
          role: 'developer',
          content: `If the user provides data about a trip that you are asked to extend, use the existing data to guide your proposals.
          Imagine a user that prefers those activities - what would they enjoy or dislike?
          For example, if the user already has a set of backpacking activities, add more backpacking.
          Conversely, if the user prefers luxury spa activities, stick to this direction.
          Don't change or correct the user's data.
          Don't repeat it: Create something different.`,
        },
        {
          role: 'user',
          content:
            'I am planning a trip. Here is my current plan in JSON format.',
        },
        {
          role: 'assistant',
          content: 'Great! Show me.',
        },
        {
          role: 'user',
          content: JSON.stringify(trip.toJSON(), null, 2),
        },
        {
          role: 'assistant',
          content: 'This is a good plan. How can I support you?',
        },
        {
          role: 'user',
          content: `Expand the plan.
            Use the provided output schema and extend my input with your suggestions for all empty fields.
            Suggest 12 activities.
            Ensure adequate time for each activity.
            Ensure there is sufficient transfer time between activity locations.`,
        },
      ]

      const requestToOpenAI = {
        model: 'gpt-5-nano', // model to use
        text: { format: zodTextFormat(tripSchemaZod, 'trip') }, // output format
        // temperature: 0.7, // randmoness & creativity (not supported on the nano model)
        max_output_tokens: 5000, // cap cost to 5000 tokens
        reasoning: { effort: 'low' }, // don't waste tokens on reasoning
        //store: false, // don't create traces
        tool_choice: 'none',
        tools: [], // don't go into an agentic black hole
        input: prompt,
      }

      const startTime = Date.now()
      const openAIresponse = await openai.responses.parse(requestToOpenAI)
      const endTime = Date.now()

      const newActivities = openAIresponse.output_parsed.activities
  

      trip.activities = [...trip.activities, ...newActivities]      

      await trip.save()
          

      const responseToClient = {
        msecs: endTime - startTime,
        tokens: openAIresponse.usage.total_tokens,
        newActivities: newActivities.length,
      }

      res.status(200).json(responseToClient)
    } catch (error) {
      console.log(error)
      next(error)
    }
  },
)

// * Show
router.get('/:tripId/activities/:actId', isSignedIn, async (req, res, next) => {
  try {
    const { tripId, actId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound()
    if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    const activity = trip.activities.id(actId)
    if (!activity) throw new NotFound()
    res.status(200).json(activity)
  } catch (error) {
    next(error)
  }
})

// * Update
router.put('/:tripId/activities/:actId', isSignedIn, async (req, res, next) => {
  try {
    const { tripId, actId } = req.params
    const trip = await Trip.findById(tripId)
    if (!trip) throw new NotFound()
    if (!trip.owner.equals(req.user._id)) throw new Forbidden()
    const activity = trip.activities.id(actId)
    if (!activity) throw new NotFound()
    activity.set(req.body)
    await trip.save()
    res.status(200).json(activity)
  } catch (error) {
    next(error)
  }
})

// * Delete
router.delete(
  '/:tripId/activities/:actId',
  isSignedIn,
  async (req, res, next) => {
    try {
      const { tripId, actId } = req.params
      const trip = await Trip.findById(tripId)
      if (!trip) throw new NotFound()
      if (!trip.owner.equals(req.user._id)) throw new Forbidden()
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
