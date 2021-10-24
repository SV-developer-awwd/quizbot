const connectToDb = require("../mongoconnect");
const serverSchema = require("../schemas/server-schema");
const {createEmbed} = require("../communication/embeds");
const {Permissions} = require("discord.js");

const setQuestionTimeout = async (robot, mess, args) => {
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

    let newTimeout = parseInt(args[1]);
    newTimeout *= 1000;

    if (isNaN(newTimeout)) {
        await mess.channel.send(
            "Invalid timeout. Please write timeout in seconds / Невалидный таймаут. Пожалуйста напишите таймаут в секундах"
        );
        return;
    }
    let crash = false;

    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne(
                    {server: mess.guild.id},
                    {questionTimeout: newTimeout}
                );
            } catch (e) {
                await mess.channel.send({
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

        await mess.channel.send({
            embeds: [
                createEmbed({
                    title: `Timeout successfully updated.\n Количество времени для ответа успешно обновлено.`,
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

const setShowRightAns = async (robot, mess, args) => {
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
    let show = args[1],
        crash = false;
    try {
        if (show === "1") {
            await connectToDb().then(async (mongoose) => {
                try {
                    await serverSchema.updateOne(
                        {server: mess.guild.id},
                        {showRightAnswer: true}
                    );
                } catch (e) {
                    await mess.channel.send({
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
        } else if (show === "0") {
            await connectToDb().then(async (mongoose) => {
                try {
                    await serverSchema.updateOne(
                        {server: mess.guild.id},
                        {showRightAnswer: false}
                    );
                } catch (e) {
                    await mess.channel.send({
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
        } else {
            await mess.channel.send({
                content: "Invalid value! / Невалидное значение!",
            });
            return;
        }

        await mess.channel.send({content: "Success! / Успех!"});
    } catch (e) {
        await mess.channel.send({
            content:
                "Uncaught error! Please try again / Ошибка! Пожалуйста попробуйте снова",
        });
    }
};

const setGameStartPerms = async (robot, mess, args) => {
    if (
        !mess.member.permissions.has(
            Permissions.FLAGS.ADMINISTRATOR
        )
    ) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    let perms = args[1],
        crash = false;
    try {
        switch (perms) {
            case "everyone":
                await connectToDb().then(async (mongoose) => {
                    try {
                        await serverSchema.updateOne(
                            {server: mess.guild.id},
                            {whoCanStartGame: "everyone"}
                        );
                    } catch (e) {
                        await mess.channel.send({
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
                            {server: mess.guild.id},
                            {whoCanStartGame: "MANAGE_ROLES"}
                        );
                    } catch (e) {
                        await mess.channel.send({
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
                            {server: mess.guild.id},
                            {whoCanStartGame: "ADMINISTRATOR"}
                        );
                    } catch (e) {
                        await mess.channel.send({
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
                            {server: mess.guild.id},
                            {whoCanStartGame: "MANAGE_CHANNELS"}
                        );
                    } catch (e) {
                        await mess.channel.send({
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
                await mess.channel.send({
                    content: "Invalid value! / Невалидное значение!",
                });
                return;
        }

        await mess.channel.send({content: "Success! / Успех!"});
    } catch (e) {
        await mess.channel.send({
            content:
                "Uncaught error! Please try again / Ошибка! Пожалуйста попробуйте снова",
        });
    }
}

const setPrefix = async (robot, mess, args) => {
    if (
        !mess.member.permissions.has(
            Permissions.FLAGS.ADMINISTRATOR
        )
    ) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }

    const prefix = !!args[1] ? args[1] : "q!"

    let crash = false;
    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne(
                    {server: mess.guild.id},
                    {prefix}
                );
            } catch (e) {
                await mess.channel.send({
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

        await mess.channel.send({
            embeds: [
                createEmbed({
                    title: `Prefix successfully changed to \`\`\`${prefix}\`\`\`.\n Префикс успешно обновлен \`\`\`${prefix}\`\`\`.`,
                }),
            ],
        });
    } catch (e) {
        await mess.channel.send({
            content: `Uncaught Error, try again please.
    Ошибка! Попробуйте еще раз.`,
        });
    }
}

module.exports = {
    setQuestionTimeout,
    setShowRightAns,
    setGameStartPerms,
    setPrefix
};
