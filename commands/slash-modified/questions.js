const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {createEmbed} = require("../../communication/embeds/embeds");
const {permsCheck} = require("../../communication/permsCheck");
const {invalidQuestionID} = require("../../communication/embeds/error-messages");

const slash_showQuestion = async (robot, interaction, options) => {
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
                await createEmbed({
                    title: "Questions / Вопросы",
                    description: str,
                }, interaction.guild.id),
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
        await invalidQuestionID(interaction, true)
        return;
    }

    let answers = "";
    for (let i = 0; i < question.answers.length; i++) {
        answers += `${i + 1}. ${question.answers[i]}\n`;
    }

    await interaction.reply({
        embeds: [
            await createEmbed({
                title: "1",
                author: `ID of question - ${question.questionID}`,
                description: `Вопрос / Question - ${question.question}
    Ответы / Answers: \n\`\`\`${answers}\`\`\`
    Правильный ответ / Right answer - ${question.answer}`,
            }, interaction.guild.id),
        ],
        files: question.images,
    });
}

module.exports = {slash_showQuestion}