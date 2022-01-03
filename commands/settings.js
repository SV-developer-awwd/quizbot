const {MessageEmbed} = require('discord.js')
const validator = require('validator')
const connectToDb = require("../mongoconnect");
const serverSchema = require("../schemas/server-schema");
const {createEmbed} = require("../communication/embeds/embeds");
const {permsCheck} = require("../communication/permsCheck");
const {uncaughtError, noPermissionsError} = require("../communication/embeds/error-messages");
const {defaultSuccessMsg} = require("../communication/embeds/success-messages");
const {confirmActions} = require("../communication/interactions/actionsConfirmation");
const {defaultSettings} = require("../defaultSettings");
const {awaitMessages} = require("../communication/interactions/awaitMessages");
const {chooseOption} = require("../communication/interactions/chooseOptionButtons");

const showSettings = async (robot, mess) => {
    if (await permsCheck(mess, "MANAGE_ROLES")) return

    let res = {}
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })

    await mess.channel.send({
        embeds: [new MessageEmbed()
            .setColor("#0000ff")
            .setTitle("Current bot settings / Текущие настройки бота")
            .addFields([
                {
                    name: "**Time to wait for an answer to a question / Время ожидания ответа на вопрос**",
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
                },
                {
                    name: `**Players waiting time (only in branch mode) / Время ожидания игроков (только в режиме веток)**`,
                    value: String(res.threadsPlayersTimeout),
                    inline: true
                },
                {
                    name: `Waiting time for confirmation of actions / Время ожидания подтверждения действий`,
                    value: String(res.confirmationTimeout),
                    inline: true
                }
            ])]
    })
}

const resetSettings = async (robot, mess) => {
    if (await permsCheck(mess, "ADMINISTRATOR")) return

    let isReset = await confirmActions(mess,
        {content: "Resetting the settings, please wait / Сбрасываем настройки, пожалуйста подождите"})

    if (!isReset) {
        return
    }

    try {
        await serverSchema.updateOne({server: mess.guild.id}, defaultSettings)

        await defaultSuccessMsg(mess)
    } catch (e) {
        await uncaughtError(mess)
    }
}

const updateSettings = async (robot, mess, args) => {
    if (await permsCheck(mess, "MANAGE_ROLES")) return

    let param = await awaitMessages(mess, {
        embeds: [
            await createEmbed({
                title: "Write the number of the parameter to be changed / Напишите номер параметра, который надо изменить",
                description: `1 - bot prefix / префикс бота
            2 - rights required to start the game / права, нужные для старта игры
            3 - showing the correct answer if no one answered correctly / показ правильного ответа, если никто правильно не ответил
            4 - time to wait for an answer to a question / время ожидания ответа на вопрос
            5 - player timeout (for threads mode only) / время ожидания игроков (только для режима веток)
            6 - timeout for confirmation of actions / время ожидания для подтверждения действий
            7 - sidebar color for messages / цвет боковой полосы у сообщений

            0 - terminate the operation / прервать операцию`
            }, mess.guild.id)
        ]
    })
    param = parseInt(param)

    if (param < 1 || isNaN(param)) {
        await mess.channel.send({content: "Invalid param / Невалидный параметр"})
        return
    }

    let data = {}
    switch (param) {
        case 1:
            if (await permsCheck(mess, "ADMINISTRATOR")) {
                await noPermissionsError(mess)
                return
            }
            data.prefix = await awaitMessages(mess, {content: "Write new bot prefix / Напишите новый префикс бота"})
            data.prefix = data.prefix.length > 0 ? data.prefix : "q!"
            break;
        case 2:
            if (await permsCheck(mess, "ADMINISTRATOR")) {
                await noPermissionsError(mess)
                return
            }

            data.whoCanStartGame = await chooseOption(mess, [
                    {
                        id: "ADMINISTRATOR",
                        text: "ADMINISTRATOR"
                    },
                    {
                        id: "MANAGE_ROLES",
                        text: "MANAGE ROLES"
                    },
                    {
                        id: "MANAGE_CHANNELS",
                        text: "MANAGE CHANNELS"
                    },
                    {
                        id: "EVERYONE",
                        text: "No special permissions"
                    }
                ],
                {content: "Choose new permissions to start the game / Выберите новые права для старта игры"})
            break;
        case 3:
            const isShow = await chooseOption(mess, [{
                id: "SHOW",
                text: "SHOW",
                style: "SUCCESS"
            }, {
                id: "DONT_SHOW",
                text: "DON'T SHOW",
                style: "DANGER"
            }])

            data.showRightAnswer = isShow === "SHOW"
            break;
        case 4:
            let qTimeout = parseInt(await awaitMessages(mess, {content: "Write the new timeout (in seconds) / Напишите новое время ожидания (в секундах)"}));
            qTimeout *= 1000;

            if (isNaN(qTimeout)) {
                await mess.channel.send(
                    {content: "Invalid timeout. Please write timeout in seconds / Невалидный таймаут. Пожалуйста напишите таймаут в секундах"}
                );
                return;
            }

            data.questionTimeout = qTimeout
            break;
        case 5:
            let mTimeout = parseInt(await awaitMessages(mess, {content: "Write the new timeout (in seconds) / Напишите новое время ожидания (в секундах)"}));
            mTimeout *= 1000;

            if (isNaN(mTimeout)) {
                await mess.channel.send(
                    {content: "Invalid timeout. Please write timeout in seconds / Невалидный таймаут. Пожалуйста напишите таймаут в секундах"}
                );
                return;
            }

            data.threadsPlayersTimeout = mTimeout
            break;
        case 6:
            let cTimeout = parseInt(await awaitMessages(mess, {content: "Write the new timeout (in seconds) / Напишите новое время ожидания (в секундах)"}));
            cTimeout *= 1000;

            if (isNaN(cTimeout)) {
                await mess.channel.send(
                    {content: "Invalid timeout. Please write timeout in seconds / Невалидный таймаут. Пожалуйста напишите таймаут в секундах"}
                );
                return;
            }

            data.confirmationTimeout = cTimeout
            break;
        case 7:
            const color = await awaitMessages(mess, {
                content: `Write color in HEX format (for example \\"#ff00ff\\") / Напишите цвет в формате HEX (к примеру \\"#ff00ff\\")`
            })
            if (!validator.isHexColor(color)) {
                await mess.channel.send({content: "Invalid color format. Write color in HEX format (for example \"#ff00ff\") / Невалидный формат цвета. Напишите цвет в формате HEX (к примеру \"#ff00ff\"). "})
                return
            }

            data.embedColor = color
            break;
        default:
            await mess.channel.send({content: "Invalid param / Невалидный параметр"})
    }

    let crash = false;
    try {
        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne(
                    {server: mess.guild.id}, data
                );
            } catch (e) {
                await uncaughtError(mess)
                crash = true;
            } finally {
                await mongoose.endSession()
            }
        });

        if (crash) return;

        await defaultSuccessMsg(mess)
    } catch (e) {
        await uncaughtError(mess)
    }
}

module.exports = {
    showSettings,
    resetSettings,
    updateSettings
};
