const {Permissions} = require("discord.js");
const connectToDb = require("../mongoconnect");
const serverSchema = require("../schemas/server-schema");
const {createEmbed} = require("../communication/embeds");

const changeMaxGamesForUser = async (robot, mess, args) => {
    if (!mess.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let maxGames = args[1] === "+-" ? Infinity : parseInt(args[1]);
    let isChange = false,
        crash = false;

    maxGames = isNaN(maxGames) ? 0 : maxGames

    await mess.channel.send({
        content: `Счетчик игр за сегодня будет сброшен в 0, количество максимальных запущенных игр за день будет изменено на ${maxGames}. Для подтверждения напишите 1. / 
  The game counter for today will be reset to 0, and the number of maximum games played for the day will be changed to ${maxGames}. To confirm, write 1.`,
    });
    await mess.channel
        .awaitMessages({
            filter: () => mess.content,
            time: 30000,
            max: 1,
            errors: [],
        })
        .then((collected) => {
            if (parseInt(collected.first().content) === 1) {
                isChange = true;
            }
        });

    if (maxGames <= 0) {
        maxGames = NaN
    }

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
                await mess.channel.send({
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
        await mess.channel.send(`Ограничитель игр ${isNaN(maxGames) ? "выключен" : `установлен на ${maxGames} игр`}! / Game limiter ${isNaN(maxGames) ? "off" : `set to ${maxGames} games`}!`)
        return;
    }

    await mess.channel.send("Операция остановлена. / Operation terminated.");
};

const clearGamesList = async (robot, mess, args) => {
    if (!mess.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let clear = false

    if (args[1] === "all") {
        await mess.channel.send({
            content:
                "Do you really wanna clear games list for today? You cannot undo it. Write TRUE if you really wanna do it / Вы реально хотите стереть весь список игр за сегодня? Это действие невозможно отменить. Напишите TRUE, если вы реально хотите это сделать",
        });
        await mess.channel
            .awaitMessages({
                filter: () => mess.content,
                time: 30000,
                max: 1,
                errors: ["time"],
            })
            .then((collected) => {
                if (
                    collected.first().content === "TRUE" ||
                    collected.first().content === "true" ||
                    collected.first().content === "True"
                ) {
                    clear = true;
                }
            }).catch(() => clear = false)

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
            await mess.channel.send({
                content: "Games list successfully cleared / Список игр успешно очищен",
            });
        } else {
            await mess.channel.send({
                content: "Operation stopped / Операция остановлена",
            });
        }
        return
    }

    let user = 0
    try {
        user = mess.mentions.users.first().id
    } catch (e) {
        await mess.channel.send('Invalid value / Невалидное значение')
        return
    }

    await connectToDb().then(async mongoose => {
        try {
            let res = await serverSchema.findOne({server: mess.guild.id})
            res.games[user] = 0
            await serverSchema.updateOne({server: mess.guild.id}, {games: res.games})
            await mess.channel.send('Success')
        } catch (e) {
            await mess.channel.send('Something went wrong... Try again please / Что-то пошло не так... Попробуйте пожалуйста еще раз')
        } finally {
            await mongoose.endSession()
        }
    })
};

const showGames = async (robot, mess) => {
    console.log(1)
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
            createEmbed({
                title: "Server leaderboard / Таблица лидеров сервера",
                description: gamesSTR,
            }),
        ],
    });
};

module.exports = {changeMaxGamesForUser, clearGamesList, showGames}