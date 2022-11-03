const questionController = require('../database/controllers/question.controller')

const txtGenerator = async (guild_id, qIDs) => {
    let string = ""

    for (let i = 0; i < qIDs.length; i++) {
        const question = await questionController.getOneQuestion(guild_id, qIDs[i])

        if (qIDs.indexOf(question.questionID) !== -1) {
            string += `ID: ${question.question_id}
        Question: ${question.question}` +
                `${question.answer_type === 0 ? "Answers: " + JSON.stringify(question.choosable_answers) : ""}`
                + `Right answer: ${question.answer_type === 0 ? question.right_choosable_answer : question.typeable_answers}
        Attachments: ${JSON.stringify(question.images)}\n
        ---------------------------------------------------\n`
        }
    }

    return string
}

module.exports = {txtGenerator}