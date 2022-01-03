const Discord = require("discord.js");
const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {createEmbed} = require("../../communication/embeds/embeds");
const {permsCheck} = require("../../communication/permsCheck");
const {uncaughtError, invalidValueError} = require("../../communication/embeds/error-messages");
const {defaultSuccessMsg} = require("../../communication/embeds/success-messages");
const validator = require("validator");

const slash_setQuestionTimeout = async (robot, interaction, options) => {
    if (await permsCheck(interaction, "MANAGE_ROLES")) return

    let newTimeout = options.getNumber('timeout')
    newTimeout *= 1000;

    if (isNaN(newTimeout)) {
        await interaction.reply(
            {content: "Invalid timeout. Please write timeout in seconds / Невалидный таймаут. Пожалуйста напишите таймаут в секундах"}
        );
        return;
    }
    let crash = false;

    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne(
                    {server: interaction.guild.id},
                    {questionTimeout: newTimeout}
                );
            } catch (e) {
                await uncaughtError(interaction, true)
                crash = true;
            } finally {
                await mongoose.endSession()
            }
        });

        if (crash) return;

        await defaultSuccessMsg(interaction, true)
    } catch (e) {
        await uncaughtError(interaction, true)
    }
};

const slash_setShowRightAns = async (robot, interaction, options) => {
    if (await permsCheck(interaction, "MANAGE_ROLES")) return

    let show = options.getBoolean('value'),
        crash = false;
    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne(
                    {server: interaction.guild.id},
                    {showRightAnswer: !!show}
                );
            } catch (e) {
                await uncaughtError(interaction, true)
                crash = true;
            } finally {
                await mongoose.endSession()
            }
        });
        if (crash) return;

        await defaultSuccessMsg(interaction, true)
    } catch (e) {
        await uncaughtError(interaction, true)
    }
};

const slash_setGameStartPerms = async (robot, interaction, options) => {
    if (await permsCheck(interaction, "ADMINISTRATOR")) return

    let perms = options.getString('perms'),
        crash = false;
    try {
        switch (perms) {
            case "everyone":
                await connectToDb().then(async (mongoose) => {
                    try {
                        await serverSchema.updateOne(
                            {server: interaction.guild.id},
                            {whoCanStartGame: "everyone"}
                        );
                    } catch (e) {
                        await uncaughtError(interaction, true)
                        crash = true;
                    } finally {
                        await mongoose.endSession()
                    }
                });
                if (crash) return;
                break
            case "MANAGE_ROLES":
                await connectToDb().then(async (mongoose) => {
                    try {
                        await serverSchema.updateOne(
                            {server: interaction.guild.id},
                            {whoCanStartGame: "MANAGE_ROLES"}
                        );
                    } catch (e) {
                        await uncaughtError(interaction, true)
                        crash = true;
                    } finally {
                        await mongoose.endSession()
                    }
                });

                if (crash) return;
                break
            case "ADMINISTRATOR":
                await connectToDb().then(async (mongoose) => {
                    try {
                        await serverSchema.updateOne(
                            {server: interaction.guild.id},
                            {whoCanStartGame: "ADMINISTRATOR"}
                        );
                    } catch (e) {
                        await uncaughtError(interaction, true)
                        crash = true;
                    } finally {
                        await mongoose.endSession()
                    }
                });

                if (crash) return;
                break
            case "MANAGE_CHANNELS":
                await connectToDb().then(async (mongoose) => {
                    try {
                        await serverSchema.updateOne(
                            {server: interaction.guild.id},
                            {whoCanStartGame: "MANAGE_CHANNELS"}
                        );
                    } catch (e) {
                        await uncaughtError(interaction, true)
                        crash = true;
                    } finally {
                        await mongoose.endSession()
                    }
                });

                if (crash) return;
                break
            default:
                await invalidValueError(interaction, true)
                return;
        }

        await defaultSuccessMsg(interaction, true)
    } catch (e) {
        await uncaughtError(interaction, true)
    }
}

const slash_setPrefix = async (robot, interaction, options) => {
    if (await permsCheck(interaction, "ADMINISTRATOR")) return

    const prefix = options.getString('prefix') ?? "q!"

    let crash = false;
    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne(
                    {server: interaction.guild.id},
                    {prefix}
                );
            } catch (e) {
                await uncaughtError(interaction, true)
                crash = true;
            } finally {
                await mongoose.endSession()
            }
        });

        if (crash) return;

        await interaction.reply({
            embeds: [
                await createEmbed({
                    title: `Prefix successfully changed to \`\`\`${prefix}\`\`\`.\n Префикс успешно обновлен \`\`\`${prefix}\`\`\`.`,
                }, interaction.guild.id),
            ],
        });
    } catch (e) {
        await uncaughtError(interaction, true)
    }
}

const slash_showSettings = async (robot, interaction) => {
    if (await permsCheck(interaction, "MANAGE_ROLES")) return

    let res = {}
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: interaction.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })

    await interaction.reply({
        embeds: [new Discord.MessageEmbed()
            .setColor("#0000ff")
            .setTitle("Current bot settings / Текущие настройки бота")
            .addFields([
                {
                    name: "**Timeout / Таймаут**",
                    value: String(res.questionTimeout),
                    inline: true
                },
                {
                    name: "**Prefix / Префикс**",
                    value: String(res.prefix),
                    inline: true
                },
                {
                    name: "**Game start perms / Права на старт игры**",
                    value: String(res.whoCanStartGame),
                    inline: true
                },
                {
                    name: "**Showing right answer (if nobody answered right) / Показ правильного ответа (если никто правильно не ответил)**",
                    value: String(res.showRightAnswer),
                    inline: true
                },
                {
                    name: "Game limiter / Ограничитель игр",
                    value: isNaN(res.games.max) ? "turned off / выключен" : `max ${res.games.max} games`,
                    inline: true
                },
                {
                    name: "Message stroke color / Цвет боковины сообщений",
                    value: String(res.embedColor),
                    inline: true
                }
            ])]
    })
}

const slash_setEmbedColor = async (robot, interaction, options) => {
    if (await permsCheck(interaction, "MANAGE_ROLES")) return

    const color = options.getString('color')
    if (!validator.isHexColor(color)) {
        await interaction.reply({content: "Invalid color format. Write color in HEX format (for example \"#ff00ff\") / Невалидный формат цвета. Напишите цвет в формате HEX (к примеру \"#ff00ff\"). "})
        return
    }

    let crash = false;
    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne(
                    {server: interaction.guild.id},
                    {embedColor: color}
                );
            } catch (e) {
                await uncaughtError(interaction, true)
                crash = true;
            } finally {
                await mongoose.endSession()
            }
        });

        if (crash) return;

        await interaction.reply({
            embeds: [
                await createEmbed({
                    title: `Embeds color successfully changed to \`\`\`${color}\`\`\`.\n Цвет успешно обновлен на \`\`\`${color}\`\`\`.`,
                }, interaction.guild.id),
            ],
        });
    } catch (e) {
        await uncaughtError(interaction, true)
    }
}

module.exports = {
    slash_setQuestionTimeout,
    slash_setShowRightAns,
    slash_setGameStartPerms,
    slash_setPrefix,
    slash_showSettings,
    slash_setEmbedColor
}