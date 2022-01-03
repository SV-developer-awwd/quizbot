const txtGenerator = (qIDs, questions) => {
    const all = qIDs.indexOf("all") !== -1

    for (let i = 0; i < qIDs.length; i++) {
        qIDs[i] = parseInt(qIDs[i])
    }

    let string = ""
    if (all) {
        for (let i = 0; i < questions.length; i++) {
            string += `ID: ${questions[i].questionID}
        Question: ${questions[i].question}
        Answers: ${JSON.stringify(questions[i].answers)}
        Right answer: ${questions[i].answer}
        Attachments: ${JSON.stringify(questions[i].images)}\n
        ---------------------------------------------------\n`
        }
    } else {
        for (let i = 0; i < questions.length; i++) {
            if (qIDs.indexOf(questions[i].questionID) !== -1) {
                string += `ID: ${questions[i].questionID}
        Question: ${questions[i].question}
        Answers: ${JSON.stringify(questions[i].answers)}
        Right answer: ${questions[i].answer}
        Attachments: ${JSON.stringify(questions[i].images)}\n
        ---------------------------------------------------\n`
            }
        }
    }

    return string
}

module.exports = {txtGenerator}