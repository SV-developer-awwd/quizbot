const {Permissions} = require("discord.js");

/**
 * PERMS:
 * ADMINISTRATOR
 * MANAGE_ROLES
 * MANAGE_CHANNELS
 */

const permsCheck = async (mess, perms) => {
    switch (perms) {
        case "ADMINISTRATOR":
            if (
                !mess.member.permissions.has(
                    Permissions.FLAGS.ADMINISTRATOR
                )
            ) {
                await mess.channel.send({
                    content: "No permissions to use this command! / Недостаточно прав!",
                })
                return false
            }
            break
        case "MANAGE_ROLES":
            if (
                !mess.member.permissions.has(
                    Permissions.FLAGS.MANAGE_ROLES
                )
            ) {
                await mess.channel.send({
                    content: "No permissions to use this command! / Недостаточно прав!",
                })
                return false
            }
            break
        case "MANAGE_CHANNELS":
            if (
                !mess.member.permissions.has(
                    Permissions.FLAGS.MANAGE_CHANNELS
                )
            ) {
                await mess.channel.send({
                    content: "No permissions to use this command! / Недостаточно прав!",
                })
                return false
            }
            break
        default:
            return true
    }
}

module.exports = {permsCheck}