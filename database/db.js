const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    password: "ararat27",
    host: "localhost",
    port: 5432,
    database: "quizbot"
})

module.exports = {pool}