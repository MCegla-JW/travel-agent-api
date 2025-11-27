import express from 'express'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import { Unauthorized, NotFound, BadRequest } from '../utils/erros.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// * Routes 
router.post('/sign-up', async (req, res, next) => {
    try {
        const { username, email, password, confirmPassword } = req.body
        if (!username || !email || !password) {
            throw new BadRequest({message: 'All fields are required'})
        }
        if (password !== confirmPassword) {
            throw new BadRequest({confirmPassword: 'Passwords must match'})
        }
        const existingUsername = await User.findOne({username})
        if (existingUsername) {
            throw new BadRequest({username: 'Username already taken'})
        }
        const existingEmail = await User.findOne({email})
        if(existingEmail) {
            throw new BadRequest({email: 'Email already taken'})
        }
        const user = await User.create(req.body)
        return res.status(201).json(user)
    } catch (error) {
        console.log(error.message)
        next(error)
    }
})

router.post('/sign-in', async (req, res, next) => {
    try {
    const { username, password } = req.body
    if (!username || !password)
        throw new BadRequest('Username and password are required')
    const userToLogIn = await User.findOne({ username: username })
    if (!userToLogIn) {
        throw new NotFound({username: 'User does not exist'})
    }
    const passwordMatch = bcrypt.compareSync(password, userToLogIn.password)
    if (!passwordMatch) {
        throw new Unauthorized({password: 'Unauthorized'})
    }
    const token = jwt.sign(
        { user: { _id: userToLogIn._id, username: userToLogIn.username} },
        process.env.TOKEN_SECRET, 
        { expiresIn: '2d'}
    )
    return res.json({token})
    } catch (error) {
    console.log(error.message)
    next(error)
    }
})


export default router