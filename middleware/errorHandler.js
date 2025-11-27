const logError = (msg) => {
  console.error(
    '🚨🚨🚨 Error:',
    msg.name,
    '(Code:',
    msg.code,
    ')',
    msg.timestamp,
  )
  console.error('Description:', msg.description)
  console.error('Trigger:', msg.request, '=>', msg.status)
  console.error('Repair:', msg.repair)
}

const errorHandler = (error, req, res, next) => {
  const backendDetails = {
    status: error.status || 500,
    code: error.code || 0,
    name: error.name || 'Generic internal server error',
    description: error.description || 'Something went wrong',
    request: `${req.method} ${req.url}`,
    repair: error.repair || 'Unknown',
    timestamp: new Date(Date.now()).toISOString(),
  }

  // Unique constraint (from Mongoose if a value is passed to the schema that must be unique)
  if (error.code === 11000) {
    backendDetails.status = 400
    backendDetails.code = 1
    backendDetails.name = 'Value not unique'
    backendDetails.description =
      'Duplicate value provided for a field that must be unique'
    backendDetails.repair = 'Provide a different value'
  }

  // Cast Error (from Express if the route cannot be cast)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    backendDetails.status = 404
    backendDetails.code = 2
    backendDetails.name = 'Not found'
    backendDetails.description = 'The requested resource could not be located.'
    backendDetails.repair =
      'Verify that the resource identifier is correct. If the resource does not exist, create it before retrying.'
  }

  // Validation Error (from Mongoose if invalid date is passed to the schema)
  if (error.name === 'ValidationError') {
    backendDetails.status = 400
    backendDetails.code = 3
    backendDetails.name = 'Invalid data'
    backendDetails.description = 'Data provided is invalid for the resource.'
    backendDetails.repair =
      'Ensure that all values meet the resource schema definition.'
  }

  let frontendMessage = {}

  if (error.payload) {
    if (typeof error.payload === 'object' && !error.payload.message) {
      frontendMessage = error.payload
    } else if (error.payload.message) {
      frontendMessage = { message: error.payload.message }
    } else if (typeof error.payload === 'string') {
      frontendMessage = { message: error.payload}
    }
  } else {
    frontendMessage = { message: error.message || 'An error occured'}
  }
  // Nice error formatting for production use, not enough detail during development
  // logError(message)
  console.error(backendDetails)
  return res.status(backendDetails.status).json({
    frontend: frontendMessage,
    backend: backendDetails
  })

}

export default errorHandler
