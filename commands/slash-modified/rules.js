const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {createEmbed} = require("../../communication/embeds");
const {Permissions} = require("discord.js");
const {getRules} = require("../../communication/getRules");

const slash_rewriteRules = async (robot, interaction, options) => {
    if (
        !interaction.member.permissions.has(
            Permissions.FLAGS.MANAGE_ROLES
        )
    ) {
        await interaction.reply({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }
    const newRules = options.getString('rules')

    if(newRules.length > 1950) {
        interaction.reply('Too long rules. / Слишком длинные правила')
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
        await interaction.reply({
            embeds: [
                createEmbed({
                    title: `Rules successfully updated.\n Правила успешно обновлены.`,
                }),
            ],
        });
    } catch (e) {
        await interaction.reply({
            content: `Uncaught Error, try again please.
    Ошибка! Попробуйте еще раз.`,
        });
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
            createEmbed({
                title: "Правила игры: ",
                description: rules,
            }),
        ],
    });
};

const slash_addRules = async (robot, interaction, options) => {
    if (
        !interaction.member.permissions.has(
            Permissions.FLAGS.MANAGE_ROLES
        )
    ) {
        await interaction.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let rules = await getRules(interaction.guild.id);
    const newRule = options.getString('rule')
    rules += `\n${newRule}`;

    if(rules.length > 1950) {
        interaction.reply(`Updated rules will be too long so I can't update them. / Обновленные правила будут слишком длинными. Я не могу обновить их.`)
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
        await interaction.reply({
            embeds: [
                createEmbed({
                    title: `Rules successfully updated.\n Правила успешно обновлены.`,
                }),
            ],
        });
    } catch (e) {
        await interaction.reply({
            content: `Uncaught Error, try again please.
    Ошибка! Попробуйте еще раз.`,
        });
    }
};

module.exports = {slash_rewriteRules, slash_showRules, slash_addRules}