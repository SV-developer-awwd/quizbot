const {awaitMessages} = require("./awaitMessages");

const getQIDs = async mess => {
    let qIDs = await awaitMessages(mess, `Write ids of questions to export dividing by comma (or "all" to export all questions) / Напишите id вопросов для экспорта, разделяя их запятой (или "all" для экспорта всех вопросов)`)
    qIDs = qIDs.split(",")

    return qIDs
}

module.exports = {getQIDs}