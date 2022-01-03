const {createEmbed} = require("./embeds");

const gameOverMsg = async (mess, slashCommand = false) => {
    if(slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: "Game over! Thanks for playing. / Игра окончена, спасибо за участие!"
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "Game over! Thanks for playing. / Игра окончена, спасибо за участие!"
            }, mess.guild.id)
        ]
    })
}

const allGamesPlayedError = async (mess, slashCommand = false) => {
    if(slashCommand) {
        return await mess.reply({
            embeds: [
                await createEmbed({
                    title: "You played max games for you today! Return tomorrow! / Вы уже сыграли максимальное количество игра на сегодня! Возвращайтесь завтра!"
                }, mess.guild.id)
            ]
        })
    }

    return await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "You played max games for you today! Return tomorrow! / Вы уже сыграли максимальное количество игра на сегодня! Возвращайтесь завтра!"
            }, mess.guild.id)
        ]
    })
}

module.exports = {gameOverMsg, allGamesPlayedError}