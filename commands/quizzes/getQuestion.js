const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const randomizer = require("random");

const getQuestion = async (guildID, specialIDS) => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: guildID})
        } finally {
            await mongoose.endSession()
        }
    })
    let questions = res.questions;
    questions = questions.filter((question) => question !== null)

    if (specialIDS.onlyQuestions.length < 1  && specialIDS.exclude.length < 1) {
        //no -only or -exclude
        return questions[randomizer.int(0, questions.length)]
    } else if (specialIDS.onlyQuestions.length >= 1 && specialIDS.exclude.length < 1) {
        // -only
        let questionsArr = []
        for (let i = 0; i < questions.length; i++) {
            if (specialIDS.onlyQuestions.indexOf(questions[i].questionID) !== -1) {
                questionsArr.push(questions[i])
            }
        }

        return questionsArr[randomizer.int(0, questions.length)]
    } else if (specialIDS.onlyQuestions.length < 1 && specialIDS.exclude.length >= 1) {
        // -exclude
        const q = questions[randomizer.int(0, questions.length)]
        if (specialIDS.exclude.indexOf(q.questionID) !== -1) {
            return getQuestion(guildID, specialIDS)
        }

        return q
    }
};

module.exports = {getQuestion}