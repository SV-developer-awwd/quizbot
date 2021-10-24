const {Permissions, MessageAttachment} = require("discord.js");
const connectToDb = require("../mongoconnect");
const serverSchema = require("../schemas/server-schema");
const fs = require("fs");
const path = require("path");

const exportAsTXT = async (robot, mess, args) => {
    if (
        !mess.member.permissions.has(
            Permissions.FLAGS.MANAGE_ROLES
        )
    ) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let questions = res.questions;
    questions = questions.filter(q => q !== null)

    let qIDs = args
    qIDs.shift()
    qIDs.pop()

    if (qIDs.length < 1) {
        await mess.channel.send({content: "No questions to export! / Нет вопросов для эекспорта!"})
        return
    }

    const all = qIDs.indexOf("all") !== -1

    for (let i = 0; i < qIDs.length; i++) {
        qIDs[i] = parseInt(qIDs[i])
    }

    let string = ""
    if (all) {
        for (let i = 0; i < questions.length; i++) {
            string += `ID: ${questions[i].questionID}
        Q: ${questions[i].question}
        Answers: ${JSON.stringify(questions[i].answers)}
        Right answer: ${questions[i].answer}
        Attachments: ${JSON.stringify(questions[i].images)}\n
        ---------------------------------------------------\n`
        }
    } else {
        for (let i = 0; i < questions.length; i++) {
            if (qIDs.indexOf(questions[i].questionID) !== -1) {
                string += `ID: ${questions[i].questionID}
        Q: ${questions[i].question}
        Answers: ${JSON.stringify(questions[i].answers)}
        Right answer: ${questions[i].answer}
        Attachments: ${JSON.stringify(questions[i].images)}\n
        ---------------------------------------------------\n`
            }
        }
    }

    try {
        await fs.writeFile(path.resolve(__dirname, "..", "storage", "questions.txt"), string, () => {
        })

        const attachment = new MessageAttachment(path.resolve(__dirname, "..", "storage", "questions.txt"), 'questions.txt')
        await mess.channel.send({
            content: "Success!",
            files: [attachment]
        })
    } catch (e) {
        await mess.channel.send("Uncaught error! Please try again / Ошибка! Пожалуйста попробуйте снова")
    }
}

module.exports = {exportAsTXT}