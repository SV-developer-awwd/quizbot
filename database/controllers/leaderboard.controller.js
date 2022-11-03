const {pool} = require('../db')

class LeaderboardController {
    async createUser(userID) {
        const newUser = await pool
            .query(`INSERT INTO leaderboard (user_id, points)
                    VALUES ($1, $2)
                    RETURNING *`,
                [userID, {}])

        return !!newUser
    }

    async getUser(user_id) {
        const user = await pool
            .query(`SELECT *
                    FROM leaderboard
                    WHERE user_id = $1`, [user_id])

        return user.rows[0]
    }

    async getUserOnServer(user_id, guild_id) {
        const user = await this.getUser(user_id)

        if (Object.keys(user.points).indexOf(guild_id) === -1) {
            user.points[guild_id] = 0
        }

        return user.points[guild_id]
    }

    async update(user_id, guild_id, incrementValue) {
        const data = await this.getUser(user_id)
        console.log(data)
        if (Object.keys(data).length < 1) {
            await this.createUser(user_id)
            return this.update(user_id, guild_id, incrementValue)
        }

        const lb = data.points

        if (!lb[guild_id]) {
            lb[guild_id] = incrementValue;
        } else {
            lb[guild_id] += incrementValue;
        }

        const res = await pool
            .query(`UPDATE leaderboard
                    SET points = $2
                    WHERE user_id = $1`, [
                user_id
            ])

        return !!res
    }

    async deleteUser(user_id) {
        const user = await pool
            .query(`DELETE
                    FROM leaderboard
                    WHERE user_id = $1`, [user_id])

        return !!user
    }
}

module.exports = new LeaderboardController()