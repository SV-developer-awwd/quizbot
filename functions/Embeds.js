const {MessageEmbed} = require("discord.js");
const ErrorMessages = require('./common_embeds/ErrorMessages');
const GameMessages = require('./common_embeds/GameMessages');
const SuccessMessages = require('./common_embeds/SuccessMessages');
const settingsController = require("../database/controllers/settings.controller");

class Embeds {
    errors = ErrorMessages
    gameMessages = GameMessages
    success = SuccessMessages

    async create (args, guild_id) {
        if (!args.title) {
            throw new Error("No title.");
        }

        const settings = await settingsController.getSettings(guild_id)
        return new MessageEmbed()
            .setColor(settings.embedColor ?? "#0000ff")
            .setTitle(args.title)
            .setAuthor({name: args.author ?? ""})
            .setDescription(args.description ?? "")
            .setThumbnail(args.thumbnail ?? "")
            .setImage(args.images ?? "")
            .setFooter({text: args.footer ?? ""});
    }
}

module.exports = new Embeds()