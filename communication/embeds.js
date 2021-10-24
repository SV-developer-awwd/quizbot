const Discord = require("discord.js");

const createEmbed = (args) => {
    if (!args.title) {
        throw new Error("No title.");
    }

    return new Discord.MessageEmbed()
        .setColor("#0000ff")
        .setTitle(args.title)
        .setAuthor(args.author ?? "")
        .setDescription(args.description ?? "")
        .setThumbnail(args.thumbnail ?? "")
        .setImage(args.img ?? "")
        .setFooter(args.footer ?? "");
};

module.exports = {createEmbed}