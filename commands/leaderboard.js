const leaderboardController = require('../database/controllers/leaderboard.controller')
const serverController = require('../database/controllers/servers.controller')
const Embeds = require('../functions/Embeds')
const Interactions = require('../functions/Interactions')
const {permsCheck} = require("../functions/permsCheck");

class Leaderboard {
    async show(msg, client) {
        const users = await serverController.getServer(msg.guild.id)
        const points = {}
        for (const u of users.users) {
            points[u] = await leaderboardController.getUserOnServer(u, msg.guild.id)
        }

        const sortedPoints = Object.fromEntries(
            Object.entries(points).sort(([, a], [, b]) => b - a)
        );

        let pointsArr = [""],
            arrID = 0,
            ids = Object.keys(sortedPoints)

        if (ids.length === 0) {
            await Embeds.errors.emptyDatabase(client, msg.guild.id, msg.channel.id)
        }

        if (ids.length > 25) {
            await msg.channel.send({
                embeds: [await Embeds.create({
                    title: "Generating leaderboard message... Please wait / Генерируем сообщение с лидербордом... Пожалуйста подождите"
                }, msg.guild.id)]
            })
        }

        for (const id of ids) {
            const user = await client.users.fetch(id)

            if (pointsArr[arrID].length > 1900) {
                arrID++
            }

            if (sortedPoints[id] !== 0) {
                pointsArr[arrID] += `\n${user.username}#${user.discriminator} - ${sortedPoints[id]}`
            }
        }

        if (pointsArr[0].length === 0 && arrID === 0){
            pointsArr[0] = "Server leaderboard is empty!"
        }

        for (let i = 0; i < pointsArr.length; i++) {
            await msg.channel.send({
                embeds: [
                    await Embeds.create({
                        title: i === 0 ? "Server leaderboard / Таблица лидеров сервера" : `Страница #${i + 1} / Page #${i + 1}`,
                        description: pointsArr[i],
                    }, msg.guild.id),
                ],
            });
        }
    }

    async clear(msg, client) {
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 8)) return

        if (await Interactions.confirmActions(client, msg.guild.id, msg.channel.id)) {
            const users = await serverController.getServer(msg.guild.id)

            for (const user of users) {
                await leaderboardController.update(user, msg.guild.id, 0)
            }

            await Embeds.success.defaultSuccess(client, msg.guild.id, msg.channel.id)
        } else {
            await Embeds.errors.operationTerminated(client, msg.guild.id, msg.channel.id)
        }
    }
}

module.exports = new Leaderboard()