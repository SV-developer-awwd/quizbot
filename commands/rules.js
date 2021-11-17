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

    const newRules = args.splice(1).join(' ')
    if(newRules.length > 1950) {
        mess.channel.send('Too long rules. / Слишком длинные правила')
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

    if(rules.length > 1950) {
        mess.channel.send(`Updated rules will be too long so I can't update them. / Обновленные правила будут слишком длинными. Я не могу обновить их.`)
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
