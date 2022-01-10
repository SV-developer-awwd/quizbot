const {MessageActionRow, MessageSelectMenu} = require("discord.js")
const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");

/**
 * OPTIONS OBJECT:
 * label: string.length <= 100
 * description: string
 * value: string.length <= 100
 */

const chooseOptionMenu = async (mess, options, sendMsg, min = 1, max = 1) => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    const confirmationTime = res.confirmationTimeout < 30 ? 30 : res.confirmationTimeout

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('OPTiON_MENU')
                .setPlaceholder('Nothing selected')
                .setMinValues(min)
                .setMaxValues(max)
                .addOptions(options),
        );

    const message = await mess.channel.send({content: sendMsg, components: [row]})

    const collector = message.createMessageComponentCollector({componentType: 'SELECT_MENU', time: confirmationTime});

    collector.on('collect', async i => {
        await i.reply({content: "Got it"})
        await collector.stop()
    })

    const promise = new Promise((res, rej) => {
        collector.on('end', async (collected) => {
            collected.forEach(c => {
                    if (c.values.length < 1) {
                        res(false)
                    }

                    res(c.values)
                }
            )
        })
    })

    return Promise.resolve(promise)
}

module.exports = {chooseOptionMenu}