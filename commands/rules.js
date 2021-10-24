const connectToDb = require("../mongoconnect");
const serverSchema = require("../schemas/server-schema");
const {createEmbed} = require("../communication/embeds");
const {Permissions} = require("discord.js");

const rewriteRules = async (robot, mess, args) => {
    if (
        !mess.member.permissions.has(
            Permissions.FLAGS.MANAGE_ROLES
        )
    ) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne(
                    {server: mess.guild.id},
                    {rules: args.splice(1).join(' ')}
                );
            } finally {
                await mongoose.endSession()
            }
        });
        await mess.channel.send({
            embeds: [
                createEmbed({
                    title: `Rules successfully updated.\n Правила успешно обновлены.`,
                }),
            ],
        });
    } catch (e) {
        await mess.channel.send({
            content: `Uncaught Error, try again please.
    Ошибка! Попробуйте еще раз.`,
        });
    }
};

const getRules = async (mess) => {
    let res = {};
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id});
        } finally {
           await mongoose.endSession()
        }
    });

    const rules = res.rules;
    return rules;
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
            createEmbed({
                title: "Правила игры: ",
                description: rules,
            }),
        ],
    });
};

const addRules = async (robot, mess, args) => {
    if (
        !mess.member.permissions.has(
            Permissions.FLAGS.MANAGE_ROLES
        )
    ) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let rules = await getRules(mess);
    const newRule = args.splice(1).join(" ");
    rules += `\n${newRule}`;

    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne({server: mess.guild.id}, {rules});
            } finally {
                await mongoose.endSession()
            }
        });
        await mess.channel.send({
            embeds: [
                createEmbed({
                    title: `Rules successfully updated.\n Правила успешно обновлены.`,
                }),
            ],
        });
    } catch (e) {
        await mess.channel.send({
            content: `Uncaught Error, try again please.
    Ошибка! Попробуйте еще раз.`,
        });
    }
};

module.exports = {showRules, rewriteRules, getRules, addRules};
