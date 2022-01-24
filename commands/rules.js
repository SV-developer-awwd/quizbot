const connectToDb = require("../mongoconnect");
const serverSchema = require("../schemas/server-schema");
const {createEmbed} = require("../communication/embeds/embeds");
const {getRules} = require("../communication/getters");
const {permsCheck} = require("../communication/permsCheck");
const {tooLongRulesError, uncaughtError} = require("../communication/embeds/error-messages");
const {defaultSuccessMsg} = require("../communication/embeds/success-messages");
const {awaitMessages} = require("../communication/interactions/awaitMessages");

const rewriteRules = async (robot, mess) => {
    if (await permsCheck(mess, "MANAGE_ROLES")) return

    const newRules = await awaitMessages(mess, {
        embeds: [await createEmbed({
            title: "Please write new rules below / Пожалуйста напишите новые правила ниже",
            footer: `1999 symbols max`
        }, mess.guild.id)]
    })
    if (newRules.length > 1999) {
        await tooLongRulesError(mess)
        return
    }

    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne(
                    {server: mess.guild.id},
                    {rules: newRules}
                );
            } finally {
                await mongoose.endSession()
            }
        });

        await defaultSuccessMsg(mess)
    } catch (e) {
        await uncaughtError(mess)
    }
};

const showRules = async (robot, mess) => {
    let res = {};
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id});
        } finally {
            await mongoose.endSession()
        }
    });
    const rules = res.rules;

    await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "Правила игры: ",
                description: rules,
            }, mess.guild.id),
        ],
    });
};

const addRules = async (robot, mess) => {
    if (await permsCheck(mess, "MANAGE_ROLES")) return

    let rules = await getRules(mess.guild.id);
    if (rules.length > 1950) {
        await tooLongRulesError(mess)
        return
    }

    const newRule = await awaitMessages(mess, {
        embeds: [await createEmbed({
            title: "Please write new rule below / Пожалуйста напишите новое правило ниже",
            footer: `${1999 - rules.length} symbols max`
        }, mess.guild.id)]
    })
    rules += `\n${newRule}`;

    if (rules.length > 1999) {
        await tooLongRulesError(mess)
        return
    }

    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne({server: mess.guild.id}, {rules});
            } finally {
                await mongoose.endSession()
            }
        });

        await defaultSuccessMsg(mess)
    } catch (e) {
        await uncaughtError(mess)
    }
};

module.exports = {showRules, rewriteRules, addRules};
