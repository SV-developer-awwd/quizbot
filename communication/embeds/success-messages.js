const {createEmbed} = require('./embeds')

const defaultSuccessMsg = async (mess, slashCommand = false) => {
    if (slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: "Success! / Успех!"
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "Success! / Успех!"
            }, mess.guild.id)
        ]
    })
}

module.exports = {defaultSuccessMsg}