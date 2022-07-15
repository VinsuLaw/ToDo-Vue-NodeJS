const { Router } = require('express')
const router = Router()
const Sessions = require('./models/token.js')
const Tasks = require('./models/tasks.js')

const { ACCESS_TOKEN_SECRET } = require('../env');

router.post('/api/add', async (req, res, next) => {
    const session = await Sessions.findOne({token: req.body.payload.sessionKey})
    const hasTasks = await Tasks.findOne({user: session.user.email})
    const now = new Date().getTime()

    if (!hasTasks) {
        const tasks = new Tasks({
            user: session.user.email,
            allTasks: {
                id: now,
                name: req.body.payload.name,
                deadline: req.body.payload.deadline,
                alarm: req.body.payload.alarm,
                type: req.body.payload.type,
                favorite: req.body.payload.favorite
            }
        })

        await tasks.save()
    } else {
        Tasks.findByIdAndUpdate(hasTasks._id, {$push: { allTasks: {
            id: now,
            name: req.body.payload.name,
            deadline: req.body.payload.deadline,
            alarm: req.body.payload.alarm,
            type: req.body.payload.type,
            favorite: req.body.payload.favorite
        }}}, {new: false}, (err, doc) => {
            if (err) throw err;
        })
    }

    next()
})

router.post('/api/gettasks', async (req, res, next) => {
    const taskType = req.query.type
    const jwtToken = req.body.headers.authorization
    const session = await Sessions.findOne({token: jwtToken})

    try {
        const userTasks = await Tasks.findOne({user: session.user.email})
        if (taskType !== 'all' && taskType !== 'important') {
            const tasks = userTasks.allTasks.filter(object => object.type === taskType)
            res.send(JSON.stringify(tasks))
        } else if (taskType === 'important') {
            const tasks = userTasks.allTasks.filter(object => object.favorite === true && object.type !== 'completed')
            res.send(JSON.stringify(tasks))
        } else {
            const searching = req.body.payload.format
            if (searching.length > 2) {
                const tasks = userTasks.allTasks.filter(object => object.name.toLowerCase().includes(searching.toLowerCase()))
                res.send(JSON.stringify(tasks))
            } else {
                res.send(null)
            }
        }
    } catch (err) {
        res.send(null)
    }
})

router.post('/api/modify', async (req, res) => {
    const jwtToken = req.body.headers.authorization
    const session = await Sessions.findOne({token: jwtToken})

    try {
        if (req.body.payload.modificator === 'complete') {
            Tasks.updateOne({'allTasks.id': req.body.payload.id}, {$set: {
                'allTasks.$.type': 'completed'
            }}, function (err, object) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(object)
                }
            })
        } else if (req.body.payload.modificator === 'setFavorite') {
            Tasks.updateOne({'allTasks.id': req.body.payload.id}, {$set: {
                'allTasks.$.favorite': true
            }}, function (err, object) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(object)
                }
            })
        } else if (req.body.payload.modificator === 'unsetFavorite') {
            Tasks.updateOne({'allTasks.id': req.body.payload.id}, {$set: {
                'allTasks.$.favorite': false
            }}, function (err, object) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(object)
                }
            })
        }
    } catch (err) {
        //
    }
})

module.exports = router