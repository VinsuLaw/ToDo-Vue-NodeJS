const {Schema, model} = require('mongoose')

const sessionSchema = new Schema({
    jwtToken: String,
    user: {
        email: String
    },
})

module.exports = model('Sessions', sessionSchema)