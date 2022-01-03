const connectToDb = require("../../mongoconnect");
const serverSchema = require("../../schemas/server-schema");
const {getQuestion} = require("./getQuestion");
const {createEmbed} = require("../../communication/embeds/embeds");
const validator = require("validator");
const {updateLB} = require("../leaderboard");

const askQuestionThreads = async (robot, threadID, guildID, gameID, onlyQuestions = [], exclude = []) => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: guildID})
        } finally {
            await mongoose.endSession()
        }
    })
    let timeout = res.questionTimeout

    const specialIDS = {
        onlyQuestions, exclude
    }

    let question = await getQuestion(guildID, specialIDS),
        answers = [],
        notOK = true

    do {
        try {
            answers = question.answers;
            notOK = false
        } catch (e) {
            question = await getQuestion(guildID, specialIDS)
            notOK = true
        }
    } while (notOK)

    let answersSTR = ``;

    for (let i = 1; i <= answers.length; i++) {
        answersSTR += `\n${i}. ${answers[i - 1]}`;
    }

    const thread = await robot.channels.fetch(threadID)

    await thread.send({
        embeds: [
            await createEmbed({
                title: question.question,
                author: `ID of question - ${question.questionID}`,
                description: answersSTR
            }, guildID),
        ],
        files: question.images
    });

    let usersAnswers = {};
    let isGameOver = false;
    let arr = [];

    await thread.send({
        content: `Write number of answer. You have ${
            timeout / 1000
        } seconds to answer. / Напишите номер ответа. У вас есть ${
            timeout / 1000
        } секунд, чтобы ответить.`,
    });
    await thread
        .awaitMessages({
            filter: () => thread.content,
            time: timeout,
            errors: [],
        })
        .then((collected) => {
            arr = Array.from(collected.values());
            if (arr.includes("--END--")) {
                throw new Error("game over")
            }
        })
        .catch((e) => {
            isGameOver = true;
            if (e.message === "game over") {
                return new Error("game over");
            }
        });
    if (isGameOver) {
        thread.send("Game over / Игра окончена");
        return new Error("game over");
    }
    await thread.send(
        "Time is up, all answers are recorded! / Время вышло, все ответы записаны!"
    );

    let isCommandEnd = false;
    for (let i = 0; i < arr.length; i++) {
        const validType = validator.isInt(arr[i].content)
        usersAnswers[arr[i].author.id] = validType ? parseInt(arr[i].content) : false

        if (arr[i].content === "--END--") {
            isCommandEnd = true;
            break;
        }
    }

    if (isCommandEnd) {
        return new Error("game over");
    }

    let correctANS = [],
        incorrectANS = []

    for (const user in usersAnswers) {
        if (!validator.isInt(String(usersAnswers[user])) && usersAnswers[user] !== "--END--") {
            incorrectANS.push(user)
            continue
        }

        if (usersAnswers[user] === "--END--") {
            throw new Error('game over')
        }

        if (question.answer === usersAnswers[user]) {
            correctANS.push(user);
        } else {
            incorrectANS.push(user);
        }
    }

    if (correctANS.length === 0 && res.showRightAnswer) {
        await thread.send(
            `Unfortunately, no one gave the correct answer, but this was the answer number ${question.answer} / К сожалению никто не дал правильный ответ, а это был ответ номер ${question.answer}`
        );
        return "";
    }

    for (let i = 0; i < correctANS.length; i++) {
        await updateLB(thread, correctANS[i], 1);
    }

    correctANS = [...new Set(correctANS)];
    incorrectANS = [...new Set(incorrectANS)];

    let correctSTR = "";
    for (let i = 0; i < correctANS.length; i++) {
        correctSTR += `<@${correctANS[i]}> `;

        if (i >= 10) {
            correctSTR += `+${correctANS.length - 10} users`
            break
        }
    }

    let incorrectSTR = "";
    for (let i = 0; i < incorrectANS.length; i++) {
        incorrectSTR += `<@${incorrectANS[i]}> `;

        if (i >= 10) {
            incorrectSTR += `+${incorrectANS.length - 10} users`
            break
        }
    }

    if (correctANS.length > 0) {
        await thread.send({
            content: correctSTR + "\nRight answer! / Правильно!",
        });
    }
    if (incorrectANS.length > 0) {
        await thread.send({
            content: incorrectSTR + "\nWrong answer! / Неправильно!",
        });
    }

    return "";
};

module.exports = {askQuestionThreads}