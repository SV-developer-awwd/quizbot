const {Permissions} = require("discord.js");
const Embeds = require('../functions/Embeds')

/**
 * PERMS:
 * ADMINISTRATOR - 8
 * MANAGE_ROLES - 2
 * MANAGE_CHANNELS - 1
 * everyone - 0
 */

const permsCheck = async (client, guild_id, channel_id, member, perms) => {
    switch (perms) {
        case 8:
            if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                await Embeds.errors.noPermissions(client, guild_id, channel_id)
                return false
            }
            break
        case 2:
            if (!member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                await Embeds.errors.noPermissions(client, guild_id, channel_id)
                return false
            }
            break
        case 1:
            if (!member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                await Embeds.errors.noPermissions(client, guild_id, channel_id)
                return false
            }
            break
        default:
            return true
    }

    return true
}

module.exports = {permsCheck}