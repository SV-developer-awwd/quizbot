const {pool} = require('../db')

class ServersController {
    async createServer(guild_id) {
        const newServer = await pool
            .query(`INSERT INTO servers (guild_id, users)
                    VALUES ($1, $2)
                    RETURNING *`,
                [guild_id, []])

        return !!newServer
    }

    async getServer(guild_id) {
        const server = await pool
            .query(`SELECT *
                    FROM servers
                    WHERE guild_id = $1`, [guild_id])

        return server.rows[0]
    }

    async addUsers (guild_id, users) {
        const server = await this.getServer(guild_id)
        if (server === {}) {
            return false
        }

        let data = server.users
        data.push(users)
        data = [...new Set(users)]

        const res = await pool
            .query(`UPDATE servers
                    SET users = $2
                    WHERE guild_id = $1`, [
                guild_id,
                data
            ])

        return !!res
    }

    async removeUsers (guild_id, users) {
        const server = await this.getServer(guild_id)
        if (server === {}) {
            return false
        }

        const data = server.users
        for (let user of users) {
            data.splice(data.indexOf(user), 1)
        }

        const res = await pool
            .query(`UPDATE servers
                    SET users = $2
                    WHERE guild_id = $1`, [
                guild_id,
                data
            ])

        return !!res
    }

    async deleteServer(guild_id) {
        const server = await pool
            .query(`DELETE
                 FROM servers
                 WHERE guild_id = $1;`, [guild_id])

        return !!server
    }
}

module.exports = new ServersController()