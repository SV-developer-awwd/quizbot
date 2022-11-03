const {pool} = require('../db')

class QuestionController {
    async createQuestion(guildID, values) {
        const newServer = await pool
            .query(`INSERT INTO questions (guild_id, question_id, question, answer_type, answers,
                                           images)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *`, [guildID, values.question_id, values.question, values.answer_type, values.answers, values.images])


        return !!newServer
    }

    async getOneQuestion(guild_id, question_id) {
        const server = await pool
            .query(`SELECT *
                    FROM questions
                    WHERE guild_id = $1
                      AND question_id = $2`, [guild_id, question_id])

        return server.rows[0]
    }

    async getAllQuestions(guild_id) {
        const server = await pool
            .query(`SELECT *
                    FROM questions
                    WHERE guild_id = $1`, [guild_id])

        return server.rows
    }

    async updateQuestion(guild_id, question_id, values) {
        const question = await this.getOneQuestion(guild_id, question_id)
        if (question === {}) {
            return false
        }

        const data = {...question, ...values}
        const res = await pool
            .query(`UPDATE questions
                    SET question    = $3,
                        answer_type = $4,
                        answers     = $5,
                        images      = $6
                    WHERE guild_id = $1
                      AND question_id = $2`, [
                guild_id,
                question_id,
                data.question,
                data.answer_type,
                data.answers,
                data.images
            ])

        return !!res
    }

    async deleteQuestion(guild_id, question_id) {
        const server = await pool
            .query(`DELETE
                    FROM questions
                    WHERE guild_id = $1
                      AND question_id = $2`, [guild_id, question_id])

        return !!server
    }

    async deleteAllQuestions(guild_id) {
        const server = await pool
            .query(`DELETE
                    FROM questions
                    WHERE guild_id = $1`, [guild_id])

        return !!server
    }
}

module.exports = new QuestionController()