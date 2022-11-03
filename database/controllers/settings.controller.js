const {pool} = require('../db')

class SettingsController {
    async createSettings(guildID) {
        const newSettings = await pool
            .query(`INSERT INTO settings (guild_id, rules, prefix, embed_color, game_start, confirmation_timeout,
                                          question_timeout, threads_timeout)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *`,
                [guildID, "No rules", "q!", "#ff0000", 0, 30000, 30000, 30000])

        return !!newSettings
    }

    async getSettings(guild_id) {
        const settings = await pool
            .query(`SELECT *
                    FROM settings
                    WHERE guild_id = $1`, [guild_id])

        return settings.rows[0]
    }

    async updateSettings(guild_id, values) {
        const settings = await this.getSettings(guild_id)
        const data = {...settings, ...values}

        const res = await pool
            .query(`UPDATE settings
                    SET rules                = $2,
                        prefix               = $3,
                        embed_color          = $4,
                        game_start           = $5,
                        confirmation_timeout = $6,
                        question_timeout     = $7,
                        threads_timeout      = $8
                    WHERE guild_id = $1`, [
                guild_id, data.rules, data.prefix, data.embed_color, data.game_start,
                data.confirmation_timeout, data.question_timeout, data.threads_timeout
            ])

        return !!res
    }

    async deleteSettings(guild_id) {
        const settings = await pool
            .query(`DELETE
                    FROM settings
                    WHERE guild_id = $1`, [guild_id])

        return !!settings
    }
}

module.exports = new SettingsController()