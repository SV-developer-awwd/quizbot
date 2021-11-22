const connectToDb = require('../mongoconnect');
const serverSchema = require("../schemas/server-schema");
const randomizer = require('random')
const {Permissions} = require('discord.js')

// RULES //
const {showRules} = require("./rules");

// QUESTIONS //
const {askQuestion} = require("./questions");
const {createEmbed} = require("../communication/embeds");


const game = async (robot, mess, args) => {
    let res = {}
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })

    const startPerms = res.whoCanStartGame

    switch (startPerms) {
        case "ADMINISTRATOR":
            if (!mess.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                await mess.channel.send({
                    content: "No permissions to use this command! / Недостаточно прав!",
                });
                return;
            }
            break;
        case "MANAGE_CHANNELS":
            if (!mess.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
                await mess.channel.send({
                    content: "No permissions to use this command! / Недостаточно прав!",
                });
                return;
            }
            break;
        case "MANAGE_ROLES":
            if (!mess.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                await mess.channel.send({
                    content: "No permissions to use this command! / Недостаточно прав!",
                });
                return;
            }
            break;
        case "everyone":
            break
        default:
    }

    if (res.games[mess.member.id] >= res.games.max && !isNaN(res.games.max)) {
        await mess.channel.send(
            "You played max games for you today! Return tomorrow! / Вы уже сыграли максимальное количество игра на сегодня! Возвращайтесь завтра!"
        );
        return
    }

    if (res.questions.length < 1) {
        await mess.channel.send(
            "No questions in database to ask you! / Нет вопросов в базе!"
        );
        return;
    }

    let acceptedRules = false,
        onlyChoseQuestions = false,
        exclude = false;
    const flag = args[1].toLowerCase()

    // FLAGS //
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
                time: 300000000,
                errors: ["time"],
            })
            .then((collected) => {
                if (parseInt(collected.first().content) === 1) {
                    acceptedRules = true
                }
            });
    }
    //only questions / exclude questions
    if (flag === "-only") {
        onlyChoseQuestions = true;
    } else if (flag === "-ex" || flag === "-exclude") {
        exclude = true;
    }

    if (!acceptedRules) {
        mess.channel.send({
            content: "Game over. / Игра окончена.",
        });
        return
    }

    let gameID = randomizer.int(100000, 999999)

    let countOfQuestions = 0,
        specialIDS = []
    if (onlyChoseQuestions || exclude) {
        await mess.channel
            .send({
                content: "Write all ids of questions dividing by comma / Напишите все id вопросов, разделяя их запятой"
            });
        await mess.channel
            .awaitMessages({
                filter: () => mess.content,
                max: 1,
                time: 300000000,
                errors: ["time"],
            })
            .then((collected) => {
                const idsRAW = collected.first().content
                let ids = idsRAW.split(",")

                for (let i = 0; i < ids.length; i++) {
                    ids[i] = parseInt(ids[i])
                }
                specialIDS = ids
            })
            .catch(() => {
            })
    }
    if ((exclude && !onlyChoseQuestions) || (!exclude && !onlyChoseQuestions)) {
        await mess.channel
            .send({
                embeds: [
                    createEmbed({
                        title: "Count of questions / Количество вопросов",
                        description: `We're starting the game. How many questions do you wanna answer? Remember, you always can close the game by writing "--END--". / 
   Мы начинаем игру. На сколько вопросов вы хотите ответить? Помните, вы всегда можете выйти из игры, написав "--END--". `,
                        author: `Game id: ${gameID}`
                    })
                ]
            });
        await mess.channel
            .awaitMessages({
                filter: () => mess.content,
                max: 1,
                time: 300000000,
                errors: ["time"],
            })
            .then((collected) => {
                const ans = collected.first().content;

                if (ans === "--END--") {
                    throw new Error("game over");
                } else {
                    countOfQuestions = parseInt(ans);
                }
            })
            .catch(() => {
            });
    }

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

    let isGameOver = false;

    if (onlyChoseQuestions) {
        countOfQuestions = specialIDS.length
    }

    if (isGameOver) {
        await mess.channel.send(
            "Game over! Thanks for playing. / Игра окончена, спасибо за участие!"
        );
        return;
    }

    for (let i = 0; i < countOfQuestions; i++) {
        const err = onlyChoseQuestions
            ? await askQuestion(mess, gameID, specialIDS, [])
            : await askQuestion(mess, gameID, [], [])
        if (!!err.message) {
            break;
        }
    }

    await mess.channel.send(
        "Game over! Thanks for playing. / Игра окончена, спасибо за участие!"
    );
};

module.exports = {game};
