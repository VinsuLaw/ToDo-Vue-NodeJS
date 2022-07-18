const { Schema, model } = require('mongoose')

const taskSchema = new Schema({
    user: String,
    allTasks: [Object]
})

module.exports = model('Tasks', taskSchema)