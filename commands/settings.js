const validator = require('validator')
const {MessageEmbed} = require('discord.js')
const settingsController = require('../database/controllers/settings.controller')
const Embeds = require('../functions/Embeds')
const Interactions = require('../functions/Interactions')
const {permsCheck} = require("../functions/permsCheck");

class SettingsCommands {
    async show(msg, client) {
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 2)) return

        const settings = await settingsController.getSettings(msg.guild.id)

        await msg.channel.send({
            embeds: [new MessageEmbed()
                .setColor(settings.embedColor ?? "#0000ff")
                .setTitle("Current bot settings / Текущие настройки бота")
                .addFields([
                    {
                        name: "Time to wait for an answer to a question",
                        value: `_${settings.question_timeout / 1000}s_`,
                        inline: false
                    },
                    {
                        name: "Prefix",
                        value: `_${settings.prefix}_`,
                        inline: false
                    },
                    {
                        name: "Game start perms",
                        value: `_${settings.game_start}_`,
                        inline: false
                    },
                    {
                        name: "Embed's stroke color",
                        value: `_${settings.embedColor}_`,
                        inline: false
                    },
                    {
                        name: `Players waiting time (only in threads mode)`,
                        value: `_${settings.threads_timeout / 1000}s_`,
                        inline: false
                    },
                    {
                        name: `Waiting time for confirmation of actions`,
                        value: `_${settings.confirmation_timeout / 1000}s_`,
                        inline: false
                    }
                ])]
        })
    }

    async reset(msg, client) {
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 8)) return

        const isReset = await Interactions.confirmActions(client, msg.guild.id, msg.channel.id)

        if (!isReset) {
            return
        }

        await settingsController.updateSettings(msg.guild.id, {
            prefix: "q!",
            embedColor: "#0000ff",
            game_start: 0,
            confirmation_timeout: 30000,
            question_timeout: 30000,
            threads_timeout: 30000
        })
        await Embeds.success.defaultSuccess(client, msg.guild.id, msg.channel.id)
    }

    async update(msg, client) {
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 2)) return

        let param = parseInt(await Interactions.menu(client, msg.guild.id, msg.channel.id, [
            {label: "Prefix", description: "Bot prefix", value: '1'},
            {label: "Game start permissions", description: "Rights required to start the game", value: '2'},
            {label: "Embed's stroke color", description: "Sidebar color for messages", value: '3'},
            {label: "Timeout for waiting an answer from player (in quizzes)", value: '4'},
            {label: "Timeout for confirmation actions", value: '5'},
            {label: "Timeout for waiting players (in threads mode)", value: '6'},
        ], {
            embeds: [await Embeds.create({
                title: "Choose parameter to change:"
            }, msg.guild.id)]
        }))

        const settings = await settingsController.getSettings(msg.guild.id)
        switch (param) {
            case 1:
                if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 8)) {
                    await Embeds.errors.noPermissions(client, msg.guild.id, msg.channel.id)
                    return
                }

                settings.prefix = await Interactions.awaitMessages(client, msg.channel.id, msg.member.id, "Write new bot prefix")

                if (settings.prefix === "/" || settings.prefix.length <= 0) {
                    await Embeds.errors.invalidValue(client, msg.guild.id, msg.channel.id)
                    await Embeds.errors.operationTerminated(client, msg.guild.id, msg.channel.id)
                    return
                }
                break;
            case 2:
                if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 8)) {
                    await Embeds.errors.noPermissions(client, msg.guild.id, msg.channel.id)
                    return
                }

                /**
                 * PERMISSIONS:
                 * 0 - everyone
                 * 1 - MANAGE_CHANNELS
                 * 2 - MANAGE_ROLES
                 * 8 - ADMINISTRATOR
                 * */
                settings.game_start = parseInt(await Interactions.menu(client, msg.guild.id, msg.channel.id, [
                        {
                            label: "ADMINISTRATOR",
                            value: '8'
                        },
                        {
                            label: "MANAGE_ROLES",
                            value: '2'
                        },
                        {
                            label: "MANAGE_CHANNELS",
                            value: '1'
                        },
                        {
                            label: "No special permissions",
                            value: '0'
                        }
                    ],
                    {
                        embeds: [await Embeds.create(
                            {title: "Choose new permissions to start the game"},
                            msg.guild.id)]
                    }))
                break;
            case 3:
                settings.embedColor = await Interactions.awaitMessages(client, msg.channel.id, msg.member.id, {
                    embeds: [await Embeds.create({
                        title: `Write color in HEX format (for example \\"#ff00ff\\")`
                    }, msg.guild.id)]
                })

                if (!validator.isHexColor(settings.embedColor)) {
                    await Embeds.errors.invalidValue(client, msg.guild.id, msg.channel.id)
                    await Embeds.errors.operationTerminated(client, msg.guild.id, msg.channel.id)
                    return
                }
                break;
            case 4:
                settings.question_timeout = parseInt(await Interactions.awaitMessages(client, msg.channel.id, msg.member.id, {
                    embeds: [await Embeds.create({
                        title: "Write the new timeout (in seconds)"
                    }, msg.guild.id)]
                }));

                if (isNaN(settings.question_timeout) || settings.question_timeout < 15 || settings.question_timeout > 300) {
                    await Embeds.errors.invalidValue(client, msg.guild.id, msg.channel.id)
                    await Embeds.errors.operationTerminated(client, msg.guild.id, msg.channel.id)
                    return
                }

                settings.question_timeout *= 1000
                break;
            case 5:
                settings.threads_timeout = parseInt(await Interactions.awaitMessages(client, msg.channel.id, msg.member.id, {
                    embeds: [await Embeds.create({
                        title: "Write the new timeout (in seconds)"
                    }, msg.guild.id)]
                }));

                if (isNaN(settings.threads_timeout) || settings.threads_timeout < 15 || settings.threads_timeout > 300) {
                    await Embeds.errors.invalidValue(client, msg.guild.id, msg.channel.id)
                    await Embeds.errors.operationTerminated(client, msg.guild.id, msg.channel.id)
                    return
                }

                settings.threads_timeout *= 1000
                break;
            case 6:
                settings.confirmation_timeout = parseInt(await Interactions.awaitMessages(client, msg.channel.id, msg.member.id, {
                    embeds: [await Embeds.create({
                        title: "Write the new timeout (in seconds)"
                    }, msg.guild.id)]
                }));

                if (isNaN(settings.confirmation_timeout) || settings.confirmation_timeout < 15 || settings.confirmation_timeout > 300) {
                    await Embeds.errors.invalidValue(client, msg.guild.id, msg.channel.id)
                    await Embeds.errors.operationTerminated(client, msg.guild.id, msg.channel.id)
                    return
                }

                settings.confirmation_timeout *= 1000
                break;
            default:
                await Embeds.errors.invalidValue(client, msg.guild.id, msg.channel.id)
        }

        if (await Interactions.confirmActions(client, msg.guild.id, msg.channel.id)) {
            await settingsController.updateSettings(msg.guild.id, settings)
            await Embeds.success.defaultSuccess(client, msg.guild.id, msg.channel.id)
        }
    }
}

module.exports = new SettingsCommands()
