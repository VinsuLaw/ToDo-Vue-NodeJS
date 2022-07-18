const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3080

const mongoose = require('mongoose')

const auth = require('./src/auth.js')
const crud = require('./src/crud.js')

const authMiddleware = require('./src/middleware/auth-headers')
const { MONGODB_URL } = require('./env.js')

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../app/dist')))

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(auth)
app.use(authMiddleware)
app.use(crud)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/build/index.html'))
})

async function start() {
    try {
        await mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true,
        })
        app.listen(PORT, () => {
            console.log(`Server is running on ${PORT} port.`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()