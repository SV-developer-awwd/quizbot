const mongoose = require('mongoose')

const serverSchema = mongoose.Schema({
    server: Number,
    rules: String,
    questions: Array,
    questionTimeout: Number,
    leaderboard: Object,
    showRightAnswer: Boolean,
    games: Object,
    questionIDs: Array,
    whoCanStartGame: String,
    prefix: String
})

module.exports = mongoose.model('server', serverSchema)