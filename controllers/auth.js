import express from 'express'
import User from '../models/user.js'

const router = express.Router()

// * Routes 
router.post('/sign-up', async (req, res) => {
    try {
        const user = await User.create(req.body)
        return res.status(200).json(user)
    } catch (error) {
        console.log(error)
    }
})

router.post('/sign-in', async (req, res) => {
    return res.json({message: 'HIT SIGN IN ROUTE'})
})

export default router