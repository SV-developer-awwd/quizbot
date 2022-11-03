const {pool} = require('../db')

class GameController {
    async createGame(guild_id, game_id, values) {
        const newGame = await pool
            .query(`INSERT INTO games (guild_id, game_id, rules, type, leaderboard, settings, questions)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *`,
                [guild_id, game_id, values.rules, values.type, values.leaderboard, values.settings, values.questions])

        return !!newGame
    }

    async getOneGame(guild_id, game_id) {
        const game = await pool
            .query(`SELECT *
                    FROM games
                    WHERE guild_id = $1
                      AND game_id = $2`, [guild_id, game_id])

        return game.rows[0]
    }

    async updateGame(guild_id, game_id, values) {
        const game = await this.getOneGame(guild_id, game_id)
        const data = {...game, ...values}

        const res = await pool
            .query(`UPDATE games
                    SET rules       = $3,
                        type        = $4,
                        leaderboard = $5,
                        settings    = $6,
                        questions   = $7
                    WHERE guild_id = $1
                      AND game_id = $2`, [
                guild_id, data.rules, data.type, data.leaderboard, data.settings, data.questions
            ])

        return !!res
    }

    async deleteGame(guild_id, game_id) {
        const game = await pool
            .query(`DELETE
                    FROM games
                    WHERE guild_id = $1
                      AND game_id`, [guild_id, game_id])

        return !!game
    }
}

module.exports = new GameController()