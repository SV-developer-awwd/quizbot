const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {createEmbed} = require("../../communication/embeds/embeds");
const {permsCheck} = require("../../communication/permsCheck");
const {uncaughtError, operationTerminatedMsg} = require("../../communication/embeds/error-messages");
const {defaultSuccessMsg} = require("../../communication/embeds/success-messages");
const {awaitMessages} = require("../../communication/interactions/awaitMessages");
const {confirmActions} = require("../../communication/interactions/actionsConfirmation");

const slash_changeMaxGamesForUser = async (robot, interaction, options) => {
    if (await permsCheck(interaction, "ADMINISTRATOR")) return

    interaction.reply({content: "starting..."})
    let maxGames = parseInt(await awaitMessages(interaction, {content: `Please write the maximum number of games per day (or "off" to disable game limiter) / Пожалуйста напишите максимальное количество игр в день (или "off", чтобы выключить ограничитель игр)`
    }))

    let isChange = await confirmActions(interaction, `Счетчик игр за сегодня будет сброшен в 0, количество максимальных запущенных игр за день будет изменено на ${isNaN(maxGames) ? "бесконечное" : maxGames}. Для подтверждения напишите 1. /
    The game counter for today will be reset to 0, and the number of maximum games played for the day will be changed to ${isNaN(maxGames) ? "infinity" : maxGames}. To confirm, write 1.`),
        crash = false;

    if (isChange) {
        await connectToDb().then(async (mongoose) => {
            try {
                let res = await serverSchema.findOne({server: interaction.guild.id})
                res.games.max = maxGames
                await serverSchema.updateOne(
                    {server: interaction.guild.id},
                    {games: res.games}
                );
            } catch (e) {
                await uncaughtError(interaction)
                crash = true;
            } finally {
                await mongoose.endSession()
            }
        });
        if (crash) return;
        await interaction.channel.send({
            embeds: [
                await createEmbed({
                    title: `Ограничитель игр ${isNaN(maxGames) ? "выключен" : `установлен на ${maxGames} игр`}! / Game limiter ${isNaN(maxGames) ? "off" : `set to ${maxGames} games`}!`
                }, interaction.channel.send)
            ]
        })
        return;
    }

    await operationTerminatedMsg(interaction)
};

const slash_clearGamesList = async (robot, interaction, options) => {
    if (await permsCheck(interaction, "ADMINISTRATOR")) return

    let user = options.getUser('user').id

    await connectToDb().then(async mongoose => {
        try {
            let res = await serverSchema.findOne({server: interaction.guild.id})
            res.games[user] = 0
            await serverSchema.updateOne({server: interaction.guild.id}, {games: res.games})

            await defaultSuccessMsg(interaction, true)
        } catch (e) {
            await uncaughtError(interaction, true)
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
            await createEmbed({
                title: "Games for the day / Игры за день",
                description: gamesSTR,
            }, interaction.guild.id),
        ],
    });
};

module.exports = {slash_changeMaxGamesForUser, slash_showGames, slash_clearGamesList}