const {MessageEmbed} = require("discord.js");
const settingsController = require("../../database/controllers/settings.controller");

/**
 *
 * ERROR TYPES:
 * 1 - No permissions
 * 2 - Invalid value
 * 3 - Invalid user
 * 4 - empty database
 * 5 - operation terminated
 * 6 - no response
 * 7 - invalid question_id
 * 8 - too long value
 * others - uncaught error
 *
 * */

class ErrorMessages {
    async uncaughtError(client, guild_id, channel_id) {
        return await ErrorMessages.#send(client, guild_id, channel_id, 0)
    }

    async noPermissions(client, guild_id, channel_id) {
        return await ErrorMessages.#send(client, guild_id, channel_id, 1)
    }

    async invalidValue(client, guild_id, channel_id) {
        return await ErrorMessages.#send(client, guild_id, channel_id, 2)
    }

    async invalidUser(client, guild_id, channel_id) {
        return await ErrorMessages.#send(client, guild_id, channel_id, 3)
    }

    async emptyDatabase(client, guild_id, channel_id) {
        return await ErrorMessages.#send(client, guild_id, channel_id, 4)
    }

    async operationTerminated(client, guild_id, channel_id) {
        return await ErrorMessages.#send(client, guild_id, channel_id, 5)
    }

    async noResponse(client, guild_id, channel_id) {
        return await ErrorMessages.#send(client, guild_id, channel_id, 6)
    }

    async invalidQuestionId(client, guild_id, channel_id) {
        return await ErrorMessages.#send(client, guild_id, channel_id, 7)
    }

    async tooLongValue(client, guild_id, channel_id) {
        return await ErrorMessages.#send(client, guild_id, channel_id, 8)
    }

    async invalidImageUrl(client, guild_id, channel_id) {
        return await ErrorMessages.#send(client, guild_id, channel_id, 9)
    }

    static async #send(client, guild_id, channel_id, error_type) {
        let title

        switch (error_type) {
            case 1:
                title = "No permissions!"
                break
            case 2:
                title = "Invalid value."
                break
            case 3:
                title = "Invalid user."
                break
            case 4:
                title = "Database is empty."
                break
            case 5:
                title = "Operation terminated."
                break
            case 6:
                title = "Unfortunately, due to lack of response, the operation was canceled."
                break
            case 7:
                title = "Invalid id of question."
                break
            case 8:
                title = "New value is too long"
                break
            case 9:
                title = "Invalid URL to picture. / Невалидная ссылка на картинку"
                break
            default:
                title = "Uncaught error! Please try again"
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

module.exports = new ErrorMessages()