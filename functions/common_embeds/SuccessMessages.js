const {MessageEmbed} = require("discord.js");
const settingsController = require("../../database/controllers/settings.controller");

/**
 *
 * SUCCESS TYPES:
 * others - default success
 *
 * */

class SuccessMessages {
    async defaultSuccess(client, guild_id, channel_id) {
        return await SuccessMessages.#send(client, guild_id, channel_id, 0)
    }

    static async #send(client, guild_id, channel_id, success_type) {
        let title

        switch (success_type) {
            default:
                title = "Success!"
        }

        const settings = await settingsController.getSettings(guild_id)

        const channel = client.channels.cache.get(channel_id)
        return await channel.send({
            embeds: [new MessageEmbed()
                .setColor(settings.embedColor ?? "#0000ff")
                .setTitle(title)]
        })
    }
}

module.exports = new SuccessMessages()