const {MessageActionRow, MessageButton, MessageSelectMenu} = require("discord.js");
const settingsController = require('../database/controllers/settings.controller')
const Embeds = require('./Embeds')

class Interactions {
    async awaitMessages(client, channel_id, member_id, sendMsg) {
        const channel = client.channels.cache.get(channel_id)
        await channel.send(sendMsg)

        const promise = new Promise(async res => {
            await channel
                .awaitMessages({
                    filter: m => m.member.id === member_id,
                    time: 30000,
                    max: 1,
                    errors: ["time"],
                })
                .then((collected) => {
                    res(collected.first().content)
                }).catch(() => {
                    res(false)
                })
        })

        return Promise.resolve(promise)
    }

    async awaitReactions (client, guild_id, channel_id, reaction, sendMsg) { // returns array of ppl who set selected reaction
        const settings = await settingsController.getSettings(guild_id)
        const channel = client.channels.cache.get(channel_id)

        const promise = new Promise(async res => {
            let users = []
            const msg = await channel
                .send(sendMsg);
            setTimeout(async () => {
                await msg.react(reaction)
            }, 200)

            await msg.awaitReactions({
                filter: (react, user) => {
                    const isUser = (react.emoji.name === reaction && user.id !== client.user.id)

                    if (isUser) {
                        users.push(user.id)
                    }

                    return isUser
                }, time: settings.timeouts.threads
            })

            users = Array.from(new Set(users))

            res(users)
        })

        return Promise.resolve(promise)
    }

    async getQuestionIds(client, guild_id, channel_id, member_id, isOne = false) {
        let qIDs = await this.awaitMessages(client, channel_id, member_id, {
            embeds: [await Embeds.create({title: `Write id${!isOne ? "s" : ""} of question${!isOne ? "s dividing by comma (or \"all\" to choose all questions)" : ""}`}, guild_id)]
        })
        qIDs = qIDs.split(",")
        qIDs.forEach(e => e.toLowerCase())

        if (qIDs.indexOf("all") !== -1)
            return -1

        qIDs.forEach(e => parseInt(e))
        qIDs.filter(e => !isNaN(e))

        return (isOne ? qIDs[0] : qIDs)
    }

    async confirmActions(client, guild_id, channel_id, sendMsg = 'Please confirm your actions', successMessage = "Operation in progress...") {
        const channel = client.channels.cache.get(channel_id)
        const settings = await settingsController.getSettings(guild_id)
        const confirmationTime = settings.confirmation_timeout

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

        const message = await channel.send({
            content: sendMsg,
            components: [row],
            ephemeral: true
        });

        const collector = message.createMessageComponentCollector({componentType: 'BUTTON', time: confirmationTime});

        collector.on('collect', async i => {
            await i.reply({content: "Got it"})
            await collector.stop()
        })

        const promise = new Promise((res) => {
            collector.on('end', async (collected) => {
                if (collected.size < 1) {
                    res(false)
                }

                collected.forEach(click => {
                        if (click.customId === "confirm") {
                            Embeds.create({title: successMessage}, guild_id)
                            res(true)
                        } else {
                            Embeds.errors.operationTerminated(client, guild_id, channel_id)
                            res(false)
                        }
                    }
                )
            })
        })

        return Promise.resolve(promise)
    }

    /**
     * OPTIONS OBJECT:
     * id: string.length <= 100
     * text: string.length <= 100
     * style?: PRIMARY || SECONDARY || SUCCESS || DANGER
     */
    async buttons(client, guild_id, channel_id, options, sendMsg = 'Please select one of the following options') {
        const channel = client.channels.cache.get(channel_id)
        const settings = await settingsController.getSettings(guild_id)
        const confirmationTime = settings.confirmation_timeout

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
        sendMsg.components = [row]
        sendMsg.ephemeral = true
        const message = await channel.send(sendMsg);

        const collector = message.createMessageComponentCollector({componentType: 'BUTTON', time: confirmationTime});

        collector.on('collect', async i => {
            await i.reply({content: "Got it"})
            await collector.stop()
        })

        const promise = new Promise((res) => {
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

    /**
     * OPTIONS OBJECT:
     * label: string.length <= 100
     * description: string
     * value: string.length <= 100
     */
    async menu(client, guild_id, channel_id, options, sendMsg) {
        const channel = client.channels.cache.get(channel_id)
        const settings = await settingsController.getSettings(guild_id)
        const confirmationTime = settings.confirmation_timeout

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('OPTION_MENU')
                    .setPlaceholder('Nothing selected')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(options) // array
            );

        let sendMessage = sendMsg
        sendMessage.components = [row]
        const message = await channel.send(sendMessage)

        const collector = message.createMessageComponentCollector({
            componentType: 'SELECT_MENU',
            time: confirmationTime
        });

        collector.on('collect', async i => {
            await i.reply({content: "Got it"})
            await collector.stop()
        })

        const promise = new Promise((res) => {
            collector.on('end', async (collected) => {
                collected.forEach(c => {
                        if (c.values.length < 1) {
                            res(false)
                        }

                        res(c.values.length > 1 ? c.values.forEach(e => parseInt(e)) : parseInt(c.values[0]))
                    }
                )
            })
        })

        return Promise.resolve(promise)
    }
}

module.exports = new Interactions()