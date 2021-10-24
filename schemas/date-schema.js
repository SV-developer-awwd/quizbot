const mongoose = require('mongoose')

const dateSchema = mongoose.Schema({
    type: String,
    date: Number
})

module.exports = mongoose.model('date', dateSchema)