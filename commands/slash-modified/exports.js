const {MessageAttachment} = require("discord.js");
const fs = require("fs");
const path = require("path");
const random = require('random')

const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {txtGenerator} = require("../../communication/exportGenerators");
const {permsCheck} = require("../../communication/permsCheck");
const {uncaughtError} = require("../../communication/embeds/error-messages");

const slash_exportAsTXT = async (robot, interaction, options) => {
    if (await permsCheck(interaction, "MANAGE_ROLES")) return

    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: interaction.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let questions = res.questions;
    questions = questions.filter(q => q !== null)

    let qIDs = options.getString('ids')

    if (qIDs.length < 1) {
        await interaction.reply({content: "No questions to export! / Нет вопросов для экспорта!"})
        return
    }

    const string = txtGenerator(qIDs, questions)

    try {
        const requestID = random.int(100000, 999999)
        await fs.writeFile(path.resolve(__dirname, "..", "..", "storage", `questions-${requestID}.txt`), string, () => {
        })

        const attachment = new MessageAttachment(path.resolve(__dirname, "..", "..", "storage", `questions-${requestID}.txt`), `questions${requestID}.txt`)
        await interaction.reply({
            content: "Success!",
            files: [attachment]
        })

        await fs.unlink(path.resolve(__dirname, "..", "..", "storage", `questions-${requestID}.txt`), () => {
        })
    } catch (e) {
        await uncaughtError(interaction, true)
    }
}

module.exports = {slash_exportAsTXT}