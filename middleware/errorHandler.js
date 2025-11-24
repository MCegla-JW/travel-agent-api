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
  const message = {
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
    message.status = 400
    message.code = 1
    message.name = 'Value not unique'
    message.description =
      'Duplicate value provided for a field that must be unique'
    message.repair = 'Provide a different value'
  }

  // Cast Error (from Express if the route cannot be cast)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    message.status = 404
    message.code = 2
    message.name = 'Not found'
    message.description = 'The requested resource could not be located.'
    message.repair =
      'Verify that the resource identifier is correct. If the resource does not exist, create it before retrying.'
  }

  // Validation Error (from Mongoose if invalid date is passed to the schema)
  if (error.name === 'ValidationError') {
    message.status = 400
    message.code = 3
    message.name = 'Invalid data'
    message.description = 'Data provided is invalid for the resource.'
    message.repair =
      'Ensure that all values meet the resource schema definition.'
  }

  // Nice error formatting for production use, not enough detail during development
  // logError(message)
  console.error(error)

  res.status(message.status).json(message)
}

export default errorHandler
