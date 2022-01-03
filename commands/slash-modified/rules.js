const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {createEmbed} = require("../../communication/embeds/embeds");
const {getRules} = require("../../communication/getters");
const {permsCheck} = require("../../communication/permsCheck");
const {tooLongRulesError, uncaughtError} = require("../../communication/embeds/error-messages");
const {defaultSuccessMsg} = require("../../communication/embeds/success-messages");

const slash_rewriteRules = async (robot, interaction, options) => {
    if (await permsCheck(interaction, "MANAGE_ROLES")) return
    const newRules = options.getString('rules')

    if(newRules.length > 1950) {
        await tooLongRulesError(interaction, true)
        return
    }

    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne(
                    {server: interaction.guild.id},
                    {rules: newRules}
                );
            } finally {
                await mongoose.endSession()
            }
        });
        await defaultSuccessMsg(interaction, true)
    } catch (e) {
        await uncaughtError(interaction, true)
    }
};

const slash_showRules = async (robot, interaction) => {
    let res = {};
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: interaction.guild.id});
        } finally {
            await mongoose.endSession()
        }
    });
    const rules = res.rules;

    await interaction.reply({
        embeds: [
            await createEmbed({
                title: "Game rules: / Правила игры: ",
                description: rules,
            }, interaction.guild.id),
        ],
    });
};

const slash_addRules = async (robot, interaction, options) => {
    if (await permsCheck(interaction, "MANAGE_ROLES")) return

    let rules = await getRules(interaction.guild.id);
    const newRule = options.getString('rule')
    rules += `\n${newRule}`;

    if(rules.length > 1950) {
        await interaction.reply({content: `Updated rules will be too long so I can't update them. / Обновленные правила будут слишком длинными. Я не могу обновить их.`
    })
        return
    }

    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne({server: interaction.guild.id}, {rules});
            } finally {
                await mongoose.endSession()
            }
        });

        await defaultSuccessMsg(interaction, true)
    } catch (e) {
        await uncaughtError(interaction, true)
    }
};

module.exports = {slash_rewriteRules, slash_showRules, slash_addRules}