const {Permissions, MessageAttachment} = require("discord.js");
const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const fs = require("fs");
const path = require("path");
const {txtGenerator} = require("../../communication/exportGenerators");

const slash_exportAsTXT = async (robot, interaction, options) => {
    if (
        !interaction.member.permissions.has(
            Permissions.FLAGS.MANAGE_ROLES
        )
    ) {
        await interaction.reply({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

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
        await fs.writeFile(path.resolve(__dirname, "..", "..", "storage", "questions.txt"), string, () => {
        })

        const attachment = new MessageAttachment(path.resolve(__dirname, "..", "..", "storage", "questions.txt"), 'questions.txt')
        await interaction.reply({
            content: "Success!",
            files: [attachment]
        })
    } catch (e) {
        await interaction.reply("Uncaught error! Please try again / Ошибка! Пожалуйста попробуйте снова")
    }
}

module.exports = {slash_exportAsTXT}