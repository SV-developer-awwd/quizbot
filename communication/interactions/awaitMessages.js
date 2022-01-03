const awaitMessages = async (mess, sendMsg) => {
    await mess.channel.send(sendMsg)
    const promise = new Promise(async (res, rej) => {
        await mess.channel
            .awaitMessages({
                filter: () => mess.content,
                time: 30000,
                max: 1,
                errors: ["time"],
            })
            .then((collected) => {
                res(collected.first().content)
            }).catch((e) => {
                res(false)
            })
    })

    return Promise.resolve(promise)
}

module.exports = {awaitMessages}