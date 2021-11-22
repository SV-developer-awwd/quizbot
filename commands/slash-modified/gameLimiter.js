const {Permissions} = require("discord.js");
const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {createEmbed} = require("../../communication/embeds");

const slash_changeMaxGamesForUser = async (robot, interaction, options) => {
    if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await interaction.reply({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let maxGames = options.getNumber('count') <= 0 ? NaN : parseInt(options.getNumber('count'));
    let crash = false;

    const replied = await interaction.reply({
        content: `Счетчик игр за сегодня будет сброшен в 0, количество максимальных запущенных игр за день будет изменено на ${isNaN(maxGames) ? "бесконечное" : maxGames}. Для подтверждения напишите 1. / 
  The game counter for today will be reset to 0, and the number of maximum games played for the day will be changed to ${isNaN(maxGames) ? "infinity" : maxGames}. To confirm, write 1.`,
    });
    console.log(replied)
     await replied.channel
        .awaitMessages({
            filter: () => interaction.content,
            time: 30000,
            max: 1,
            errors: [],
        })
        .then((collected) => {
            if (parseInt(collected.first().content) === 1) {
                console.log("success")
            }
        });

    await connectToDb().then(async (mongoose) => {
        try {
            let res = await serverSchema.findOne({server: interaction.guild.id})
            res.games.max = maxGames
            await serverSchema.updateOne(
                {server: interaction.guild.id},
                {games: res.games}
            );
        } catch (e) {
            await interaction.reply({
                embeds: [
                    createEmbed({
                        title: `Uncaught error. Please try again \n Ошибка! Пожалуйста попробуйте снова`,
                    }),
                ],
            });
            crash = true;
        } finally {
            await mongoose.endSession()
        }
    });
    if (crash) return;
    await interaction.reply(`Ограничитель игр ${isNaN(maxGames) ? "выключен" : `установлен на ${maxGames} игр`}! Счетчик игр за день был сброшен в 0 / Game limiter ${isNaN(maxGames) ? "off" : `set to ${maxGames} games`}! The game counter for the day has been reset to 0`)

};

const slash_clearGamesList = async (robot, interaction, options) => {
    if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await interaction.reply({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let user = options.getUser('user').id

    await connectToDb().then(async mongoose => {
        try {
            let res = await serverSchema.findOne({server: interaction.guild.id})
            res.games[user] = 0
            await serverSchema.updateOne({server: interaction.guild.id}, {games: res.games})
            await interaction.reply('Success')
        } catch (e) {
            await interaction.reply('Something went wrong... Try again please / Что-то пошло не так... Попробуйте пожалуйста еще раз')
        } finally {
            await mongoose.endSession()
        }
    })
};

const slash_showGames = async (robot, interaction) => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: interaction.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let games = res.games;

    const sortedGames = Object.fromEntries(
        Object.entries(games).sort(([, a], [, b]) => b - a)
    );

    let gamesSTR = "";
    let ids = Object.keys(sortedGames)

    ids.pop()

    for (const id of ids) {
        if (id === "max") {
            continue
        }

        const user = await robot.users.fetch(id)
        gamesSTR += `\n${user.username}#${user.discriminator} - ${sortedGames[id]}`;
    }


    await interaction.reply({
        embeds: [
            createEmbed({
                title: "Server leaderboard / Таблица лидеров сервера",
                description: gamesSTR,
            }),
        ],
    });
};

module.exports = {slash_changeMaxGamesForUser, slash_showGames, slash_clearGamesList}