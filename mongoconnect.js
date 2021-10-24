const mongoose = require('mongoose')

async function connectToDb() {
    try {
        await mongoose.connect(process.env.db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            keepAlive: true
        })
    } catch (e) {
        console.log("MONGO RETRY")
        await connectToDb()
    }
    return mongoose.startSession();
}

module.exports = connectToDb