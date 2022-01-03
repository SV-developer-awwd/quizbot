const connectToDb = require("../mongoconnect");
const serverSchema = require("../schemas/server-schema")

const getRules = async (serverID) => {
    let res = {};
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: serverID});
        } finally {
            await mongoose.endSession()
        }
    });

    return res.rules;
};

module.exports = {getRules}