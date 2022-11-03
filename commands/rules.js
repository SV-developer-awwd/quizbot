const settingsController = require('../database/controllers/settings.controller')
const Embeds = require('../functions/Embeds')
const Interactions = require('../functions/Interactions')
const {permsCheck} = require("../functions/permsCheck")

class Rules {
    async add (msg, client) { // old + new
        if (!await permsCheck(client, msg.guild.id, msg.client.id, msg.member, 2)) return

        const data = await settingsController.getSettings(msg.guild.id)
        let rules = data.rules

        if (rules.length > 1950) {
            await Embeds.errors.tooLongValue(client, msg.guild.id, msg.channel.id)
            return
        }

        const newRule = await Interactions.awaitMessages(msg, {
            embeds: [await Embeds.create({
                title: "Please write new rule below / Пожалуйста напишите новое правило ниже",
                footer: `${1999 - rules.length} symbols max`
            }, msg.guild.id)]
        })
        rules += `\n${newRule}`;

        if (rules.length > 1999) {
            await Embeds.errors.tooLongValue(client, msg.guild.id, msg.channel.id)
            return
        }

        await settingsController.updateSettings(msg.guild.id, {rules})
        await Embeds.success.defaultSuccess(client, msg.guild.id, msg.channel.id)
    }

    async rewrite (msg, client) { // only new
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 2)) return

        const newRules = await Interactions.awaitMessages(msg, {
            embeds: [await Embeds.create({
                title: "Please write new rules below / Пожалуйста напишите новые правила ниже",
                footer: `1999 symbols max`
            }, msg.guild.id)]
        })
        if (newRules.length > 1999) {
            await Embeds.errors.tooLongValue(client, msg.guild.id, msg.channel.id)
            return
        }

        await settingsController.updateSettings(msg.guild.id, {rules: newRules})
        await Embeds.success.defaultSuccess(client, msg.guild.id, msg.channel.id)
    }

    async show (msg) {
        let data = await settingsController.getSettings(msg.guild.id)

        await msg.channel.send({
            embeds: [
                await Embeds.create({
                    title: "Правила игры: ",
                    description: data.rules,
                }, msg.guild.id),
            ],
        })
    }
}

module.exports = new Rules()