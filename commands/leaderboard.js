const connectToDb = require('../mongoconnect');
const serverSchema = require("../schemas/server-schema");

const {createEmbed} = require("../communication/embeds");
const {Permissions} = require("discord.js");

const showLB = async (robot, mess) => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
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

    for (const id of ids) {
        const user = await robot.users.fetch(id)

        if(pointsArr[arrID].length > 1900) {
            arrID++
            console.log("arrID++")
        }
        pointsArr[arrID] += `\n${user.username}#${user.discriminator} - ${sortedPoints[id]}`
    }

    for (let i = 0; i < pointsArr.length; i++) {
        console.log("ready to send")
        await mess.channel.send({
            embeds: [
                createEmbed({
                    title: i === 0 ? "Server leaderboard / Таблица лидеров сервера" : `Страница #${i+1} / Page #${i+1}`,
                    description: pointsArr[i],
                }),
            ],
        });
        console.log("sent")
    }
};

const updateLB = async (mess, userID, value) => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let lb = res.leaderboard;

    if (!lb[userID]) {
        lb[userID] = value;
    } else {
        lb[userID] += value;
    }

    await connectToDb().then(async mongoose => {
        try {
            await serverSchema.updateOne({server: mess.guild.id}, {leaderboard: lb, questionIDs: []})
        } finally {
            await mongoose.endSession()
        }
    })
};

const clearLB = async (robot, mess, args) => {
    if (!mess.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let user = ""
    if (args[1] === "all") user = "all"
    else if (mess.mentions.users.first()) user = mess.mentions.users.first().id
    else {
        await mess.channel.send({
            content: "Invalid user! / Невалидный пинг!",
        });
        return;
    }

    if (!mess.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let clear = false

    await mess.channel.send({
        content:
            user === "all"
                ? "Do you really wanna delete leaderboard? You cannot undo it. Write TRUE if you really wanna do it / Вы реально хотите стереть весь лидерборд? Это действие невозможно отменить. Напишите TRUE, если вы реально хотите это сделать"
                : "Do you really wanna delete information about this man in the leaderboard? Write TRUE if you really wanna do it / Вы реально хотите стереть информацию об этом человеке в лидерборде? Напишите TRU, если вы реально хотите это сделать"
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
                await serverSchema.updateOne({server: mess.guild.id}, {
                    leaderboard:
                        user === "all" ? {} : {
                            [user]: 0
                        }
                })
            } finally {
                await mongoose.endSession()
            }
        })
        await mess.channel.send({
            content:
                user === "all"
                    ? "Leaderboard successfully cleared / Лидерборд успешно очищен"
                    : "Information successfully cleared / Информация успешно удалена"
        });
    } else {
        await mess.channel.send({
            content: "Operation stopped / Операция остановлена",
        });
    }
};

module.exports = {showLB, updateLB, clearLB};
