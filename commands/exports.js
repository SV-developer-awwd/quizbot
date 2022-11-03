const {MessageAttachment} = require("discord.js");
const fs = require("fs");
const path = require("path");
const random = require('random')

const {txtGenerator} = require("../functions/exportGenerators");
const {permsCheck} = require("../functions/permsCheck");
const Embeds = require('../functions/Embeds')
const Interactions = require('../functions/Interactions')

class Exports {
    async chooseFormat(msg, client) {
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 2)) return

        const exportType = parseInt(await Interactions.menu(client, msg.guild.id, msg.channel.id, [{
            label: "Text document",
            description: "*.txt",
            value: "1"
        }], {embeds: await Embeds.create({
                title: "please select the file extension to which the questions will be exported:"
            }, msg.guild.id)}))

        switch (exportType) {
            case 1:
                await this.#txt(client, msg.guild.id, msg.channel.id, msg.member)
                break
            default:
                await Embeds.errors.invalidValue(client, msg.guild.id, msg.channel.id)
        }
    }

    async #txt(client, guild_id, channel_id, member_id) {
        const channel = client.channels.cache.get(channel_id)

        const qIDs = await Interactions.getQuestionIds(client, guild_id, channel_id, member_id)

        if (qIDs.length < 1) {
            await Embeds.errors.emptyDatabase(client, guild_id, channel_id)
            return
        }

        for (let i = 0; i < qIDs.length; i++) {
            qIDs[i] = parseInt(qIDs[i])
        }

        qIDs.filter(e => !isNaN(e))
        qIDs.filter(e => e !== null)

        const string = txtGenerator(guild_id, qIDs)

        try {
            const requestID = random.int(100000, 999999)
            await fs.writeFile(path.resolve(__dirname, "..", "storage", `questions-${requestID}.txt`), string, () => {
            })

            const attachment = new MessageAttachment(path.resolve(__dirname, "..", "storage", `questions-${requestID}.txt`), `questions-${requestID}.txt`)
            await Embeds.success.defaultSuccess(client, guild_id, channel_id)
            await channel.send({files: [attachment]})

            await fs.unlink(path.resolve(__dirname, "..", "storage", `questions-${requestID}.txt`), () => {
            })
        } catch (e) {
            await Embeds.errors.uncaughtError(client, guild_id, channel_id)
        }
    }
}

module.exports = new Exports()