import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { Unauthorized, NotFound } from '../utils/erros.js'

const isSignedIn = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) throw new Unauthorized('No auth header found')
        const token = authHeader.split(' ')[1]
        const decodedPayload = jwt.verify(token, process.env.TOKEN_SECRET)
        const user = await User.findById(decodedPayload.user._id)
        if (!user) throw new NotFound('User not found in database')
        req.user = user
        next()
    } catch (error) {
        console.log(error.message)
        next(new Unauthorized('Unauthorized'))
    }
}

export default isSignedIn