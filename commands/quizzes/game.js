const connectToDb = require('../../mongoconnect');
const serverSchema = require("../../schemas/server-schema");
const randomizer = require('random')
const {permsCheck} = require("../../communication/permsCheck");

// RULES //
const {showRules} = require("../rules");

// QUESTIONS //
const {askQuestionNormal} = require("./askQuestionNormal");

// MESSAGES //
const {gameOverMsg, allGamesPlayedError} = require("../../communication/embeds/game-messages");
const {noQuestionsError} = require("../../communication/embeds/error-messages");
const {createEmbed} = require("../../communication/embeds/embeds");
const {askQuestionThreads} = require("./askQuestionThreads");
const {getQIDs} = require("../../communication/interactions/getQIDs");
const {awaitMessages} = require("../../communication/interactions/awaitMessages");

const game = async (robot, mess, args) => {
    let res = {}
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })

    // perms-check
    const startPerms = res.whoCanStartGame
    let isGameOver = false;
    switch (startPerms) {
        case "ADMINISTRATOR":
            if (await permsCheck(mess, "ADMINISTRATOR")) return
            break;
        case "MANAGE_CHANNELS":
            if (await permsCheck(mess, "MANAGE_CHANNELS")) return
            break;
        case "MANAGE_ROLES":
            if (await permsCheck(mess, "MANAGE_ROLES")) return
            break;
        case "EVERYONE":
            break
        default:
    }

    // max-games-check
    if (res.games[mess.member.id] >= res.games.max && !isNaN(res.games.max)) {
        await allGamesPlayedError(mess)
        return
    }

    // no-questions-check
    if (res.questions.length < 1) {
        await noQuestionsError(mess)
        return;
    }

    let acceptedRules = false,
        onlyChoseQuestions = false,
        exclude = false,
        isThreads = false
    const flag = args[1].toLowerCase()

    //------------------ RULES ------------------//
    if (flag === "-y" || flag === "-yes") {
        acceptedRules = true
    } else {
        await showRules(robot, mess);
        await mess.channel.send({
            content: `Do you accept with game rules? Write **1** if yes and **0** if no. /
     Вы согласны с правилами игры? напишите **1**, если да, и **0**, если нет.`,
        });
        await mess.channel
            .awaitMessages({
                filter: () => mess.content,
                max: 1,
                time: res.confirmationTimeout,
                errors: ["time"],
            })
            .then((collected) => {
                if (parseInt(collected.first().content) === 1) {
                    acceptedRules = true
                }
            });
    }
    //---------------- END RULES ----------------//

    if (!acceptedRules) {
        await gameOverMsg(mess)
        return
    }

    const gameID = randomizer.int(100000, 999999)

    //------------------ ONLY QUESTIONS / EXCLUDE QUESTIONS ------------------ //
    if (flag === "-only") {
        onlyChoseQuestions = true;
    } else if (flag === "-ex" || flag === "-exclude") {
        exclude = true;
    }

    let countOfQuestions = 0,
        specialIDS = []
    if (onlyChoseQuestions || exclude) {
        specialIDS = await getQIDs(mess)
        specialIDS.forEach(e => {
            parseInt(e)
        })
    }

    if ((exclude && !onlyChoseQuestions) || (!exclude && !onlyChoseQuestions)) {
        countOfQuestions = await awaitMessages(mess, {
            embeds: [
                await createEmbed({
                    title: "Count of questions / Количество вопросов",
                    description: `We're starting the game. How many questions do you wanna answer? Remember, you always can close the game by writing "--END--". / 
   Мы начинаем игру. На сколько вопросов вы хотите ответить? Помните, вы всегда можете выйти из игры, написав "--END--". `,
                    author: `Game id: ${gameID}`
                }, mess.guild.id)
            ]
        })

        if (countOfQuestions === "--END--") {
            return
        }

        countOfQuestions = parseInt(countOfQuestions)
    }

    if (onlyChoseQuestions) {
        countOfQuestions = specialIDS.length
    }
    //------------------ END ONLY QUESTIONS / EXCLUDE QUESTIONS ------------------ //

    // max-games-increment
    if (!isNaN(res.games.max)) {
        let playedGames = res.games;
        if (!playedGames[mess.member.id]) {
            playedGames[mess.member.id] = 1;
        } else {
            playedGames[mess.member.id] += 1;
        }

        await connectToDb().then(async (mongoose) => {
            try {
                await serverSchema.updateOne({server: mess.guild.id}, {games: playedGames});
            } finally {
                await mongoose.endSession()
            }
        });
    }

    if (isGameOver) {
        await gameOverMsg(mess)
        return;
    }

    //------------------- THREADS CHECK -------------------//
    if (flag === "-th" || flag === "-threads") {
        isThreads = true
    }
    //------------------- END THREADS CHECK -------------------//

    //------------------- NORMAL GAME ------------------//
    if (!isThreads) {
        for (let i = 0; i < countOfQuestions; i++) {
            const err = onlyChoseQuestions
                ? await askQuestionNormal(mess, gameID, specialIDS, [])
                : await askQuestionNormal(mess, gameID, [], [])
            if (!!err.message) {
                break;
            }
        }
        return
    }
    //------------------ END NORMAL GAME ------------------//

    //------------------ THREADS GAME ------------------//
    let usersToPlay = []
    let peopleInThread = 0

    const joinMsg = await mess.channel
        .send({
            content: "React under this message if you want to play the quiz / Поставьте реакт под этим сообщением, чтобы поучаствовать в квизе"
        });
    setTimeout(async () => {
        await joinMsg.react("\u2705")
    }, 200)

    await joinMsg.awaitReactions({
        filter: (react, user) => {
            const isUser = (react.emoji.name === '\u2705' && user.id !== joinMsg.author.id)

            if (isUser) {
                usersToPlay.push(user.id)
            }

            return isUser
        }, time: 15000
    }).catch(err => {
        console.log(err.message)
    })

    usersToPlay = Array.from(new Set(usersToPlay))

    if (usersToPlay.length === 0) {
        await mess.channel.send({
                embeds: [
                    await createEmbed({title: "No users to play the quiz!"}, mess.guild.id)
                ]
            }
        )
        return
    }

    peopleInThread = await awaitMessages(mess, {
        content: "How many people should be in 1 thread? / Сколько человек должно быть в 1 канале?"
    })

    if (peopleInThread === "--END--") {
        await gameOverMsg(mess)
        return
    }

    peopleInThread = parseInt(peopleInThread) < 1 ? 1 : parseInt(peopleInThread)

    let roomID = 1
    const threads = []
    for (let i = 0; i < usersToPlay.length / peopleInThread; i += peopleInThread) {
        const thread = await mess.channel.threads.create({
            name: `Room ${roomID}`,
            autoArchiveDuration: 60,
            reason: `Room #${roomID} for the quiz`
        })

        await thread.join()

        for (let j = 0; j < peopleInThread; j++) {
            await thread.members.add(usersToPlay[0])

            usersToPlay.shift()
            usersToPlay = usersToPlay.filter(el => !isNaN(el))

            if (usersToPlay.length < 1) {
                break
            }
        }

        threads.push(thread.id)

        if (usersToPlay.length < 1) {
            break
        }

        roomID++
    }

    for (let i = 0; i < countOfQuestions; i++) {
        for (let j = 0; j < threads.length; j++) {
            const err = onlyChoseQuestions
                ? await askQuestionThreads(robot, threads[j], mess.guild.id, gameID, specialIDS, [])
                : await askQuestionThreads(robot, threads[j], mess.guild.id, gameID, [], [])
            if (!!err.message) {
                break;
            }
        }
    }

    for (let i = 0; i < threads.length; i++) {
        await robot.channels.fetch(threads[i]).send({
            embeds: [
                await createEmbed({
                    title: "Game over! Thanks for playing. / Игра окончена, спасибо за участие!"
                }, mess.guild.id)
            ]
        })
    }
    //------------------ END THREADS GAME ------------------//

    await gameOverMsg(mess)
}

module.exports = {game};
