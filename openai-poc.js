import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import 'dotenv/config'

const openai = new OpenAI()

const Activity = z.object({
  title: z.string(),
  description: z.string(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  websiteUrl: z.string().describe("A valid URL"),
  // imageUrl: z.string().describe("A valid URL"),
  mapUrl: z.string().describe("A valid URL"),
})

const Trip = z.object({
  title: z.string(),
  description: z.string(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  activities: z.array(Activity),
})

const start = Date.now()

const response = await openai.responses.parse({
  // Control randomness/creativity of the response
  // temperature: 0.7, -- not supported on the nano model, always set to 1

  // Control cost
  //max_output_tokens: 150,
  reasoning: { effort: 'low' },

  // Don't leave traces
  store: false,

  // Don't go into an agentic black hole
  tool_choice: 'none',
  tools: [],

  // keep it simple
  text: {
    format: zodTextFormat(Trip, 'trip'),
    verbosity: 'low',
  },

  // The cheapest model
  model: 'gpt-5-nano',

  // The actual prompt
  input: [
    {
      role: 'developer',
      content: `You are a travel expert.
        You know every spot on Earth as if you had lived there for a decade.
        You know local customs, local food, local sights to see: the hidden gems and the mandatory sites.`,
    },
    {
      role: 'developer',
      content: `Your tone is crisp, clear, and concise.
        It always contains a sparkle of inspiration and colour.`,
    },
    {
      role: 'developer',
      content: `Where a link is required, you always provide valid URLs that are known to work. Do not imagine something; prefer null if you are unsure`,
    },
    {
      role: 'developer',
      content: `If you need to provide a map URL, create a Google Map query URL like https://www.google.com/maps/search/?api=1&query=Fushimi+Inari+Taisha`,
    },
    {
      role: 'developer',
      content: `If the user asks for something outside of travel suggestions and activities, respond with an error.`,
    },
    {
      role: 'user',
      content: 'Suggest a trip to Kyoto, Japan. Include a set of 5 activities.',
    },
  ],
})

const end = Date.now()

console.log(`Msecs: ${end-start}`)
console.log(`Total tokens: ${response.usage.total_tokens} (${response.model})`)
console.log(response.output_parsed)
