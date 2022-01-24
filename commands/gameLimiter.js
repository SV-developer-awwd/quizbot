const connectToDb = require("../mongoconnect");
const serverSchema = require("../schemas/server-schema");
const {createEmbed} = require("../communication/embeds/embeds");
const {permsCheck} = require("../communication/permsCheck");
const {uncaughtError, operationTerminatedMsg, invalidValueError} = require("../communication/embeds/error-messages");
const {defaultSuccessMsg} = require("../communication/embeds/success-messages");
const {confirmActions} = require("../communication/interactions/actionsConfirmation");
const {awaitMessages} = require("../communication/interactions/awaitMessages");

const changeMaxGamesForUser = async (robot, mess) => {
    if (await permsCheck(mess, "ADMINISTRATOR")) return

    let maxGames = parseInt(await awaitMessages(mess, {content: `Please write the maximum number of games per day (or "off" to disable game limiter) / Пожалуйста напишите максимальное количество игр в день (или "off", чтобы выключить ограничитель игр)`
}))

    if (maxGames < 1 || isNaN(maxGames)) {
        maxGames = NaN
    }

    let isChange = await confirmActions(mess, `Счетчик игр за сегодня будет сброшен в 0, количество максимальных запущенных игр за день будет изменено на ${isNaN(maxGames) ? "бесконечное" : maxGames}. Для подтверждения напишите 1. /
    The game counter for today will be reset to 0, and the number of maximum games played for the day will be changed to ${isNaN(maxGames) ? "infinity" : maxGames}. To confirm, write 1.`),
        crash = false;

    if (isChange) {
        await connectToDb().then(async (mongoose) => {
            try {
                let res = await serverSchema.findOne({server: mess.guild.id})
                res.games.max = maxGames
                await serverSchema.updateOne(
                    {server: mess.guild.id},
                    {games: res.games}
                );
            } catch (e) {
                await uncaughtError(mess)
                crash = true;
            } finally {
                await mongoose.endSession()
            }
        });
        if (crash) return;
        await mess.channel.send({
            embeds: [
                await createEmbed({
                    title: `Ограничитель игр ${isNaN(maxGames) ? "выключен" : `установлен на ${maxGames} игр`}! / Game limiter ${isNaN(maxGames) ? "off" : `set to ${maxGames} games`}!`
                })
            ]
        })
        return;
    }

    await operationTerminatedMsg(mess)
};

const clearGamesList = async (robot, mess, args) => {
    if (await permsCheck(mess, "ADMINISTRATOR")) return

    let clear = false,
        users = await awaitMessages(mess, `Please @mention the users to be removed (or write "all" to remove all information) / Пожалуйста @упомяните пользователей, информацию о которых надо удалить (или напишите "all", чтобы удалить информацию обо всех)`)

    if (users === "all") {
        clear = await confirmActions(mess)

        if (clear) {
            await connectToDb().then(async mongoose => {
                try {
                    const res = await serverSchema.findOne({server: mess.guild.id})
                    const max = res.games.max
                    await serverSchema.updateOne({server: mess.guild.id}, {games: {max}})
                } finally {
                    await mongoose.endSession()
                }
            })
            await defaultSuccessMsg(mess)
        } else {
            await operationTerminatedMsg(mess)
        }
        return
    }

    let user = 0
    try {
        user = mess.mentions.users.first().id
    } catch (e) {
        await invalidValueError(mess)
        return
    }

    await connectToDb().then(async mongoose => {
        try {
            let res = await serverSchema.findOne({server: mess.guild.id})
            res.games[user] = 0
            await serverSchema.updateOne({server: mess.guild.id}, {games: res.games})

            await defaultSuccessMsg(mess)
        } catch (e) {
            await uncaughtError(mess)
        } finally {
            await mongoose.endSession()
        }
    })
};

const showGames = async (robot, mess) => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
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

    await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "Games for the day / Игры за день",
                description: gamesSTR.length > 0 ? gamesSTR : "No games played today",
            }, mess.guild.id),
        ],
    });
};

module.exports = {changeMaxGamesForUser, clearGamesList, showGames}