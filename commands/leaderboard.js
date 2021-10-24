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

    let pointsSTR = "";
    let ids = Object.keys(sortedPoints)

    for (const id of ids) {
        const user = await robot.users.fetch(id)
        pointsSTR += `\n${user.username}#${user.discriminator} - ${sortedPoints[id]}`;
    }


    await mess.channel.send({
        embeds: [
            createEmbed({
                title: "Server leaderboard / Таблица лидеров сервера",
                description: pointsSTR,
            }),
        ],
    });
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

const clearLB = async (robot, mess) => {
    if (!mess.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let clear = false

    await mess.channel.send({
        content:
            "Do you really wanna delete leaderboard? You cannot undo it. Write TRUE if you really wanna do it / Вы реально хотите стереть весь лидерборд? Это действие невозможно отменить. Напишите TRUE, если вы реально хотите это сделать",
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
                await serverSchema.updateOne({server: mess.guild.id}, {leaderboard: {}})
            } finally {
                await mongoose.endSession()
            }
        })
        await mess.channel.send({
            content: "Leaderboard successfully cleared / Лидерборд успешно очищен",
        });
    } else {
        await mess.channel.send({
            content: "Operation stopped / Операция остановлена",
        });
    }
};

module.exports = {showLB, updateLB, clearLB};
