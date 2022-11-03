const leaderboardController = require("./database/controllers/leaderboard.controller")
const serversController = require("./database/controllers/servers.controller");
const settingsController = require("./database/controllers/settings.controller");
const commands = require("./Commands");

class Events {
    constructor() {
    }

    ready(client) {
        return client.on("ready", async function () {
            console.log(client.user.username + " successfully started!")
        });
    }

    guildCreate(client) {
        return client.on("guildCreate", async guild => {
            await settingsController.createSettings(guild.id)
            await settingsController.updateSettings(guild.id, {
                settings: {
                    timeouts: {
                        confirmation: 30000,
                        question: 30000,
                        threads: 30000
                    },
                    game_start: 0,
                    prefix: "q!",
                    embedColor: "#0000ff"
                }
            })

            const serverUsers = []
            await serversController.createServer(guild.id)
            await guild.members.fetch()
            guild.members.cache.forEach(member => {
                if (!member.user.bot) {
                    serverUsers.push(member.user.id)
                }
            })

            await serversController.addUsers(guild.id, serverUsers)
        })
    }

    guildDelete(client) {
        return client.on("guildDelete", async guild => {
            await settingsController.deleteSettings(guild.id)
            await serversController.deleteServer(guild.id)
        })
    }

    guildMemberAdd (client) {
        return client.on("guildMemberAdd", async (user) => {
            await serversController.addUsers(user.guild.id, [user.user.id])

            if (await leaderboardController.getUser(user.guild.id) === undefined) {
                await leaderboardController.createUser(user.user.id)
            }
        })
    }

    guildMemberRemove (client) {
        return client.on("guildMemberRemove",async (user) => {
            await serversController.removeUsers(user.guild.id, [user.user.id])
        })
    }

    message (client) {
        return client.on('message', async (msg) => {
            const settings = await settingsController.getSettings(msg.guild.id)
            const prefix = settings === undefined ? process.env.PREFIX : settings.prefix

            if (msg.author.username !== client.user.username && msg.author.discriminator !== client.user.discriminator) {
                let message_content = msg.content.split(" ")
                message_content.forEach(e => e.toLowerCase())

                if (message_content[0].startsWith(prefix)) {
                    message_content = message_content[0].substring(prefix.length)
                    for (const command in commands) {
                        if (message_content === command) {
                            await commands[command](msg, client)
                        }
                    }
                }
            }
        })
    }
}

module.exports = new Events()