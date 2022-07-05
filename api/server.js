const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3080

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../app/public')))

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))

app.post('/api/reg', (req, res) => {
    console.log('POST');
    console.log(req.body);             
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/public/index.html'))
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT} port.`);
})