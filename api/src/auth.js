const {Router} = require('express')
const router = Router()
const User = require('./models/user')
const Sessions = require('./models/token.js')
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs');
const { ACCESS_TOKEN_SECRET } = require('../env');

router.post('/api/auth/signup', async (req, res, next) => {
    try {
        const {name, email, password} = req.body
        const candidate = await User.findOne({ email })
        if (candidate) {
            res.json({status: 208, message: 'Already'})
        } else {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({
                name, email, password: hashPassword
            })
            await user.save()

            const accessToken = jwt.sign({useremail: email, role: 'user'}, ACCESS_TOKEN_SECRET, { expiresIn: '60m' })
            const session = new Sessions({
                jwtToken: accessToken, user: {email: email}
            })
            await session.save()

            res.json({status: 201, message: 'Signup OK', token: accessToken})
        }
    } catch (e) {
        res.json({status: 408, message: 'Undefined ERROR'})
    }

    next()
})

router.post('/api/auth/login', async (req, res, next) => {
    console.log('in auth')
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({ email })
        if (candidate) {
            const isSame = await bcrypt.compare(password, candidate.password)

            if (isSame) {
                const accessToken = jwt.sign({useremail: candidate.email, role: 'admin'}, ACCESS_TOKEN_SECRET, { expiresIn: '60m' })
                const session = new Sessions({
                    jwtToken: accessToken, user: {email: candidate.email}
                })
                await session.save()
                res.json({status: 200, message: 'Auth OK', token: accessToken})

            } else {
                res.json({status: 406, message: 'Wrong password'})
            }
        } else {
            res.json({status: 404, message: 'Undefined email'})
        }
    } catch (e) {
        res.json({status: 408, message: 'Undefined error'})
    }
})

router.post('/api/logout', async (req, res, next) => {
    const {token} = req.body
    
    let item = await Sessions.findOne({token})
    try {
        await Sessions.deleteOne({_id: item._id})
        res.status(200).json({message: 'Logout OK'})
    } catch (error) {
        res.status(408).json({message: 'Logout FAIL'})
    }

    next()
})

module.exports = router