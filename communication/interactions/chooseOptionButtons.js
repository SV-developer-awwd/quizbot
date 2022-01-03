const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {MessageActionRow, MessageButton} = require("discord.js");

/**
 * OPTIONS OBJECT:
 * id: string.length <= 100
 * text: string.length <= 100
 * style?: PRIMARY || SECONDARY || SUCCESS || DANGER
 */

const chooseOptionButtons = async (mess, options, sendMsg = 'Please select one of the following options / Пожалуйста выберите один из следующих вариантов') => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    const confirmationTime = res.confirmationTimeout

    let buttons = []
    for (let i = 0; i < options.length; i++) {
        buttons.push(
            new MessageButton()
                .setCustomId(options[i].id)
                .setLabel(options[i].text)
                .setStyle(options[i].style ?? "PRIMARY")
        )
    }

    const row = new MessageActionRow().addComponents(buttons);
    const message = await mess.channel.send({
        content: sendMsg,
        components: [row],
        ephemeral: true
    });

    const collector = message.createMessageComponentCollector({componentType: 'BUTTON', time: confirmationTime});

    collector.on('collect', async i => {
        await i.reply({content: "Got it"})
        await collector.stop()
    })

    const promise = new Promise((res, rej) => {
        collector.on('end', async (collected) => {
            if (collected.size < 1) {
                res(false)
            }

            collected.forEach(click => {
                    for (let i = 0; i < options.length; i++) {
                        if (click.customId === options[i].id) {
                            res(click.customId)
                        }
                    }
                }
            )
        })
    })

    return Promise.resolve(promise)
}

module.exports = {chooseOption: chooseOptionButtons}