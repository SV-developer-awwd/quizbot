const {Permissions} = require("discord.js");
const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {createEmbed} = require("../../communication/embeds");

const slash_showQuestion = async (robot, interaction, options) => {
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
    let id = options.getString('lb')
    let question = {};

    if (id === "all") {
        let str = "";

        questions = questions.filter(q => q !== null)

        const sortedQuestions = questions.sort((a, b) =>
            a.questionID > b.questionID ? 1 : -1
        );

        for (let q of sortedQuestions) {
            str += `${q.questionID} - ${q.question}\n`;
        }

        await interaction.reply({
            embeds: [
                createEmbed({
                    title: "Questions / Вопросы",
                    description: str,
                }),
            ],
        });

        return
    }

    id = parseInt(id)

    for (let q of questions) {
        if (q === null) {
            continue;
        }

        if (q.questionID === id) {
            question = q;
            break;
        }
    }

    if (isNaN(id) || Object.keys(question).length === 0) {
        await interaction.reply("Невалидный id вопроса! / Invalid id of question!");
        return;
    }

    let answers = "";
    for (let i = 0; i < question.answers.length; i++) {
        answers += `${i + 1}. ${question.answers[i]}\n`;
    }

    await interaction.reply({
        embeds: [
            createEmbed({
                title: "1",
                author: `ID of question - ${question.questionID}`,
                description: `Вопрос / Question - ${question.question}
    Ответы / Answers: \n\`\`\`${answers}\`\`\`
    Правильный ответ / Right answer - ${question.answer}`,
            }),
        ],
        files: question.images,
    });
}

module.exports = {slash_showQuestion}