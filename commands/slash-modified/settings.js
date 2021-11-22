const {Permissions} = require("discord.js");
const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {createEmbed} = require("../../communication/embeds");

const slash_setQuestionTimeout = async (robot, interaction, options) => {
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

    let newTimeout = options.getNumber('timeout')
    newTimeout *= 1000;

    if (isNaN(newTimeout)) {
        await interaction.reply(
            "Invalid timeout. Please write timeout in seconds / Невалидный таймаут. Пожалуйста напишите таймаут в секундах"
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
                await interaction.reply({
                    embeds: [
                        createEmbed({
                            title: `Uncaught error. Please try again \n Ошибка! Пожалуйста попробуйте снова`,
                        }),
                    ],
                });
                crash = true;
            } finally {
                await mongoose.endSession()
            }
        });

        if (crash) return;

        await interaction.reply({
            embeds: [
                createEmbed({
                    title: `Timeout successfully updated.\n Количество времени для ответа успешно обновлено.`,
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

const slash_setShowRightAns = async (robot, interaction, options) => {
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
                await interaction.reply({
                    embeds: [
                        createEmbed({
                            title: `Uncaught error. Please try again \n Ошибка! Пожалуйста попробуйте снова`,
                        }),
                    ],
                });
                crash = true;
            } finally {
                await mongoose.endSession()
            }
        });
        if (crash) return;

        await interaction.reply({content: "Success! / Успех!"});
    } catch (e) {
        await interaction.reply({
            content:
                "Uncaught error! Please try again / Ошибка! Пожалуйста попробуйте снова",
        });
    }
};

const slash_setGameStartPerms = async (robot, interaction, options) => {
    if (
        !interaction.member.permissions.has(
            Permissions.FLAGS.ADMINISTRATOR
        )
    ) {
        await interaction.reply({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

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
                        await interaction.reply({
                            embeds: [
                                createEmbed({
                                    title: `Uncaught error. Please try again \n Ошибка! Пожалуйста попробуйте снова`,
                                }),
                            ],
                        });
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
                        await interaction.reply({
                            embeds: [
                                createEmbed({
                                    title: `Uncaught error. Please try again \n Ошибка! Пожалуйста попробуйте снова`,
                                }),
                            ],
                        });
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
                        await interaction.reply({
                            embeds: [
                                createEmbed({
                                    title: `Uncaught error. Please try again \n Ошибка! Пожалуйста попробуйте снова`,
                                }),
                            ],
                        });
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
                        await interaction.reply({
                            embeds: [
                                createEmbed({
                                    title: `Uncaught error. Please try again \n Ошибка! Пожалуйста попробуйте снова`,
                                }),
                            ],
                        });
                        crash = true;
                    } finally {
                        await mongoose.endSession()
                    }
                });

                if (crash) return;
                break
            default:
                await interaction.reply({
                    content: "Invalid value! / Невалидное значение!",
                });
                return;
        }

        await interaction.reply({content: "Success! / Успех!"});
    } catch (e) {
        await interaction.reply({
            content:
                "Uncaught error! Please try again / Ошибка! Пожалуйста попробуйте снова",
        });
    }
}

const slash_setPrefix = async (robot, interaction, options) => {
    if (
        !interaction.member.permissions.has(
            Permissions.FLAGS.ADMINISTRATOR
        )
    ) {
        await interaction.reply({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

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
                await interaction.reply({
                    embeds: [
                        createEmbed({
                            title: `Uncaught error. Please try again \n Ошибка! Пожалуйста попробуйте снова`,
                        }),
                    ],
                });
                crash = true;
            } finally {
                await mongoose.endSession()
            }
        });

        if (crash) return;

        await interaction.reply({
            embeds: [
                createEmbed({
                    title: `Prefix successfully changed to \`\`\`${prefix}\`\`\`.\n Префикс успешно обновлен \`\`\`${prefix}\`\`\`.`,
                }),
            ],
        });
    } catch (e) {
        await interaction.reply({
            content: `Uncaught Error, try again please.
    Ошибка! Попробуйте еще раз.`,
        });
    }
}

module.exports = {slash_setQuestionTimeout, slash_setShowRightAns, slash_setGameStartPerms, slash_setPrefix}