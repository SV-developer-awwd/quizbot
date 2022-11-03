const {MessageEmbed} = require("discord.js");
const settingsController = require("../../database/controllers/settings.controller");

/**
 *
 * MESSAGE TYPES:
 * 1 - all games played for today
 * others - game over
 *
 * */

class GameMessages {
    async gameOver (client, guild_id, channel_id) {
        return await GameMessages.#send(client, guild_id, channel_id, 0)
    }

    static async #send(client, guild_id, channel_id, msg_type) {
        let title

        switch (msg_type) {
            default:
                title = "Game over! Thanks for playing."
        }

        const settings = await settingsController.getSettings(guild_id)

        const channel = client.channels.cache.get(channel_id)
        return await channel.send({
            embeds: [new MessageEmbed()
                .setColor(settings.embedColor ?? "#0000ff")
                .setTitle(title)]
        }, guild_id)
    }
}

module.exports = new GameMessages()