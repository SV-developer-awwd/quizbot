const Discord = require("discord.js");
const connectToDb = require("../../mongoconnect");
let serverSchema = require('../../schemas/server-schema')

const createEmbed = async (args, serverID) => {
    if (!args.title) {
        throw new Error("No title.");
    }

    let res = {}
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: serverID})
        } finally {
            await mongoose.endSession()
        }
    })

    const color = res.embedColor ?? "#0000ff"

    return new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(args.title)
        .setAuthor(args.author ?? "")
        .setDescription(args.description ?? "")
        .setThumbnail(args.thumbnail ?? "")
        .setImage(args.images ?? "")
        .setFooter(args.footer ?? "");
};

module.exports = {createEmbed}