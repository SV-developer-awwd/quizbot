const {MessageActionRow, MessageButton} = require("discord.js");
const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");

const confirmActions = async (mess, sendMsg = 'Please confirm your actions / Пожалуйста подтвердите свои действия', successMessage = "Operation in progress... / Операция выполняется...") => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    const confirmationTime = res.confirmationTimeout

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('confirm')
                .setLabel('CONFIRM')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('terminate')
                .setLabel("TERMINATE")
                .setStyle('DANGER')
        );

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
                    if (click.customId === "confirm") {
                        mess.channel.send({content: successMessage})
                        res(true)
                    } else {
                        mess.channel.send({content: "Canceled / Отменено"})
                        res(false)
                    }
                }
            )
        })
    })

    return Promise.resolve(promise)
}

module.exports = {confirmActions}