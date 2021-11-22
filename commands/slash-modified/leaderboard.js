const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");

const {createEmbed} = require("../../communication/embeds");
const {Permissions} = require("discord.js");

const slash_showLB = async (robot, interaction) => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: interaction.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let lb = res.leaderboard;

    const sortedPoints = Object.fromEntries(
        Object.entries(lb).sort(([, a], [, b]) => b - a)
    );

    let pointsArr = [""],
        arrID = 0
    let ids = Object.keys(sortedPoints)

    if (ids.length > 25) {
        await interaction.reply({
            content: "Generating leaderboard message... Please wait / Генерируем сообщение с лидербордом... Пожалуйста подождите"
        })
    }

    for (const id of ids) {
        const user = await robot.users.fetch(id)

        if (pointsArr[arrID].length > 1900) {
            arrID++
        }
        pointsArr[arrID] += `\n${user.username}#${user.discriminator} - ${sortedPoints[id]}`
    }

    for (let i = 0; i < pointsArr.length; i++) {
        await interaction.reply({
            embeds: [
                createEmbed({
                    title: i === 0 ? "Server leaderboard / Таблица лидеров сервера" : `Страница #${i + 1} / Page #${i + 1}`,
                    description: pointsArr[i],
                }),
            ],
        });
    }
};

const slash_clearLB = async (robot, interaction, options) => {
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        await interaction.reply({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let user = options.getUser('user')

    await connectToDb().then(async mongoose => {
        try {
            await serverSchema.updateOne({server: interaction.guild.id}, {
                leaderboard: {[user]: 0}
            })
        } finally {
            await mongoose.endSession()
        }
    })
    await interaction.reply({
        content: "Information successfully cleared / Информация успешно удалена"
    });
};

module.exports = {slash_clearLB, slash_showLB}