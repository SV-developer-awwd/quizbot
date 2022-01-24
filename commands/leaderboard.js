const connectToDb = require('../mongoconnect');
const serverSchema = require("../schemas/server-schema");

const {createEmbed} = require("../communication/embeds/embeds");
const {permsCheck} = require("../communication/permsCheck");
const {invalidUserError, operationTerminatedMsg} = require("../communication/embeds/error-messages");
const {defaultSuccessMsg} = require("../communication/embeds/success-messages");
const {confirmActions} = require("../communication/interactions/actionsConfirmation");

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
    
    if(ids.length > 25) {
        await mess.channel.send({
            content: "Generating leaderboard message... Please wait / Генерируем сообщение с лидербордом... Пожалуйста подождите"
        })
    }

    for (const id of ids) {
        const user = await robot.users.fetch(id)

        if(pointsArr[arrID].length > 1900) {
            arrID++
        }
        pointsArr[arrID] += `\n${user.username}#${user.discriminator} - ${sortedPoints[id]}`
    }

    for (let i = 0; i < pointsArr.length; i++) {
        await mess.channel.send({
            embeds: [
                await createEmbed({
                    title: i === 0 ? "Server leaderboard / Таблица лидеров сервера" : `Страница #${i+1} / Page #${i+1}`,
                    description: pointsArr[i],
                }, mess.guild.id),
            ],
        });
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
    if (await permsCheck(mess, "MANAGE_ROLES")) return

    let user = ""
    if (args[1] === "all") user = "all"
    else if (mess.mentions.users.first()) user = mess.mentions.users.first().id
    else {
        await invalidUserError(mess)
        return;
    }

    if (await permsCheck(mess, "ADMINISTRATOR")) return

    let clear = await confirmActions(mess)

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
        await defaultSuccessMsg(mess)
    } else {
        await operationTerminatedMsg(mess)
    }
};

module.exports = {showLB, updateLB, clearLB};
