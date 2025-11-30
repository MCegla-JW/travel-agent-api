import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { Unauthorized, NotFound } from '../utils/errors.js'

const isSignedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) throw new Unauthorized('No auth header found')
    const token = authHeader.split(' ')[1]
    if (!token) throw new Unauthorized('Payload missing')
    const decodedPayload = jwt.verify(token, process.env.TOKEN_SECRET)
    const user = await User.findById(decodedPayload.user._id)
    if (!user) throw new NotFound('User not found in database')
    req.user = user
    next()
  } catch (error) {
    console.log(error.message)
    if (error.name === 'JsonWebTokenError')
      return next(new Unauthorized('Invalid token'))
    if (error.name === 'TokenExpiredError')
      return next(new Unauthorized('Token expired'))
    next(error)
  }
}

export default isSignedIn
