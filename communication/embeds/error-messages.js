const {createEmbed} = require("./embeds");

const noPermissionsError = async (mess, slashCommand = false) => {
    if (slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: "No permissions! / Недостаочно прав!"
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "No permissions! / Недостаочно прав!"
            }, mess.guild.id)
        ]
    })
}

const uncaughtError = async (mess, slashCommand = false) => {
    if (slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: "Uncaught error! Please try again / Ошибка! Пожалуйста попробуйте снова"
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "Uncaught error! Please try again / Ошибка! Пожалуйста попробуйте снова"
            }, mess.guild.id)
        ]
    })
}

const noQuestionsError = async (mess, slashCommand = false) => {
    if (slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: "No questions in database! / Нет вопросов в базе!"
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "No questions in database! / Нет вопросов в базе!"
            }, mess.guild.id)
        ]
    })
}

const operationTerminatedMsg = async (mess, slashCommand = false) => {
    if (slashCommand) {
        await mess.reply({
            embeds: [
                await createEmbed({
                    title: "Операция остановлена. / Operation terminated."
                }, mess.guild.id)
            ]
        })
    }

    await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "Operation terminated. / Операция остановлена."
            }, mess.guild.id)
        ]
    })
}

const invalidValueError = async (mess, slashCommand = false) => {
    if (slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: 'Invalid value / Невалидное значение'
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: 'Invalid value / Невалидное значение'
            }, mess.guild.id)
        ]
    })
}

const invalidUserError = async (mess, slashCommand = false) => {
    if (slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: 'Invalid user / Невалидный пользователь'
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: 'Invalid user / Невалидный пользователь'
            }, mess.guild.id)
        ]
    })
}

const noResponseError = async (mess, slashCommand = false) => {
    if (slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: "Unfortunately, due to lack of response, the operation was canceled. / К сожалению из-за отсутствия ответа операция была прервана."
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "Unfortunately, due to lack of response, the operation was canceled. / К сожалению из-за отсутствия ответа операция была прервана."
            }, mess.guild.id)
        ]
    })
}

const invalidQuestionID = async (mess, slashCommand = false) => {
    if(slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: "Invalid id of question! / Невалидный id вопроса!"
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "Invalid id of question! / Невалидный id вопроса!"
            }, mess.guild.id)
        ]
    })
}

const tooLongRulesError = async (mess, slashCommand = false) => {
    if(slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: 'Too long rules. / Слишком длинные правила'
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: 'Too long rules. / Слишком длинные правила'
            }, mess.guild.id)
        ]
    })
}

module.exports = {
    noPermissionsError,
    uncaughtError,
    noQuestionsError,
    operationTerminatedMsg,
    invalidValueError,
    invalidUserError,
    noResponseError,
    invalidQuestionID,
    tooLongRulesError
}