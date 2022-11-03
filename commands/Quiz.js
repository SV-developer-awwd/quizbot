const randomizer = require('random')
const Embeds = require('../functions/Embeds')
const Interactions = require('../functions/Interactions')
const Threads = require('../functions/Threads')
const leaderboardController = require("../database/controllers/leaderboard.controller");
const settingsController = require('../database/controllers/settings.controller')
const questionController = require('../database/controllers/question.controller')
const {permsCheck} = require("../functions/permsCheck");

class Quiz {
    async start(msg, client) {
        const settings = await settingsController.getSettings(msg.guild.id)
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, settings.game_start)) return

        const questions = await questionController.getAllQuestions(msg.guild.id)
        if (questions.length < 1) {
            await Embeds.errors.emptyDatabase(client, msg.guild.id, msg.channel.id)
            return;
        }

        const acceptedRules = parseInt(await Interactions.buttons(client, msg.guild.id, msg.channel.id, [{
            id: "1",
            text: "ACCEPT",
            style: "SUCCESS"
        }, {
            id: "0",
            text: "DON'T ACCEPT",
            style: "DANGER"
        }], {
            embeds: [await Embeds.create({
                    title: `Do you accept the game rules?`,
                    description: settings.rules
                }
                , msg.guild.id)]
        }))

        if (!acceptedRules) {
            await Embeds.gameMessages.gameOver(client, msg.guild.id, msg.channel.id)
            return
        }

        /**
         * TODO: max-games-increment
         * */

        const game_type = await Interactions.menu(client, msg.guild.id, msg.channel.id, [
            {
                label: "Normal",
                description: "Players should write answers in the same channel (questions with choosable and typeable answers)",
                value: "0"
            },
            {
                label: "Threads mode",
                description: "Players should write answers in branches (questions with choosable and typeable answers)",
                value: "1"
            }
        ], {
            embeds: [await Embeds.create({
                title: "Please choose game mode:"
            }, msg.guild.id)]
        })

        switch (game_type) {
            case 0:
                await Quiz.#normalMode(client, msg.guild.id, msg.channel.id, msg.member.id)
                break
            case 1:
                await Quiz.#threadsMode(client, msg.guild.id, msg.channel.id, msg.member.id)
                break
            default:
        }
    }

    static async #normalMode(client, guild_id, channel_id, member_id) {
        const countOfQuestions = await Quiz.#getCountOfQuestions(client, guild_id, channel_id, member_id)

        const questions = await Quiz.#chooseQuestions(client, guild_id, channel_id, countOfQuestions)
        for (let q of questions) {
            await Quiz.#askQuestion(client, guild_id, channel_id, q)
        }

        await Embeds.gameMessages.gameOver(client, guild_id, channel_id)
    }

    static async #threadsMode(client, guild_id, channel_id, member_id) {
        const channel = client.channels.cache.get(channel_id)
        let usersToPlay = await Interactions.awaitReactions(client, guild_id, channel_id, '\u2705', {
            embeds: [await Embeds.create({title: "React under this message if you want to play the quiz"}, guild_id)]
        })
        usersToPlay = usersToPlay.filter(user => parseInt(user) !== client.user.id)

        if (usersToPlay.length === 0) {
            await channel.send({
                    embeds: [
                        await Embeds.create({title: "No users to play the quiz!"}, guild_id)
                    ]
                }
            )
            return
        }

        const peopleInThread = parseInt(await Interactions.awaitMessages(client, channel_id, member_id, {
            embeds: [await Embeds.create({title: "How many people should be in 1 thread?"}, guild_id)]
        }))

        if (peopleInThread < 1 || isNaN(peopleInThread)) {
            await Embeds.errors.invalidValue(client, guild_id, channel_id)
            return
        }

        const threads = []
        let roomId = 1

        while (usersToPlay.length >= 1) {
            threads.push(
                await Threads.create(client, channel_id, `Room ${roomId}`, `Room for the quiz`, false)
            )

            const users = []
            for (let j = 0; j < peopleInThread; j++) {
                users.push(usersToPlay.shift())
            }
            await Threads.addMembers(client, threads[threads.length - 1], users)
            roomId += 1
        }

        const countOfQuestions = await Quiz.#getCountOfQuestions(client, guild_id, channel_id, member_id),
            questions = await Quiz.#chooseQuestions(client, guild_id, channel_id, countOfQuestions)

        for (const q of questions) {
            for (const thread of threads) {
                await this.#askQuestion(client, guild_id, thread, q)
            }
        }

        for (const thread of threads) {
            await Embeds.gameMessages.gameOver(client, guild_id, thread)

            await Threads.leave(client, thread)
            await Threads.archive(client, thread, true)
        }
    }

    static async #askQuestion(client, guild_id, channel_id, question) {
        const settings = await settingsController.getSettings(guild_id)

        const channel = await client.channels.cache.get(channel_id)

        let correctANS = [],
            incorrectANS = []

        switch (question.answer_type) {
            case 0:
                let answersSTR = ``;
                if (question.answer_type === 0) {
                    for (const key in question.answers) {
                        if (key === "rightChoosable") {
                            continue
                        }

                        answersSTR += `\n${Object.keys(question.answers).indexOf(key) + 1}: ${question.answers[key]}`;
                    }
                }

                await channel.send({
                    embeds: [
                        await Embeds.create({
                            title: question.question,
                            author: `ID of question - ${question.question_id}`,
                            description: answersSTR
                        }, guild_id),
                    ],
                    files: question.images
                });

                const usersAnswers = await Quiz.#getAnswers(client, channel_id, settings.timeouts.question)

                for (const user in usersAnswers) {
                    if (question.answers.rightChoosable + 1 === parseInt(usersAnswers[user])) {
                        correctANS.push(user);
                    } else {
                        incorrectANS.push(user);
                    }
                }
                break;
            case 1:
                await channel.send({
                    embeds: [
                        await Embeds.create({
                            title: question.question,
                            author: `ID of question - ${question.question_id}`
                        }, guild_id),
                    ],
                    files: question.images
                });

                const answers = await Quiz.#getAnswers(client, channel_id, settings.question_timeout)

                for (const user in answers) {
                    if (question.answers.typeable === answers[user]) {
                        correctANS.push(user);
                    } else {
                        incorrectANS.push(user);
                    }
                }
                break;
            default:
        }

        for (const user of correctANS) {
            await leaderboardController.update(guild_id, user, 1)
        }

        await Quiz.#showResults(client, channel_id, correctANS, incorrectANS)

        return "";
    }

    static async #getAnswers(client, channel_id, question_timeout) {
        const channel = client.channels.cache.get(channel_id)
        let arr = [],
            usersAnswers = {}

        await channel.send({
            content: `Write number of answer. You have ${
                question_timeout / 1000
            } seconds to answer`,
        });
        await channel
            .awaitMessages({
                filter: m => !isNaN(parseInt(m.content)),
                time: question_timeout,
                errors: [],
            })
            .then((collected) => {
                arr = Array.from(collected.values());
            })

        await channel.send(
            "Time is up, all answers are recorded!"
        )

        for (let i = 0; i < arr.length; i++) {
            usersAnswers[arr[i].author.id] = arr[i].content
        }

        return usersAnswers
    }

    static async #getCountOfQuestions(client, guild_id, channel_id, member_id) {
        const count = parseInt(await Interactions.awaitMessages(client, channel_id, member_id, {
            embeds: [await Embeds.create({title: "Please write count of questions in the quiz"}, guild_id)]
        }))

        if (isNaN(count)) {
            await Embeds.errors.invalidValue(client, guild_id, channel_id)
            await Embeds.gameMessages.gameOver(client, guild_id, channel_id)
            return -1
        }

        return count
    }

    static async #chooseQuestions(client, guild_id, channel_id, countOfQuestions) {
        const dbQuestions = await questionController.getAllQuestions(guild_id)
        let questions = [],
            repeats = false

        if (countOfQuestions > dbQuestions.length) {
            repeats = await Interactions.confirmActions(client, guild_id, channel_id,
                'Requested count of questions more than count of them in the database so they can repeat. Is it OK?')
        }

        while (questions.length !== countOfQuestions) {
            for (let i = 0; i < countOfQuestions - questions.length; i++) {
                questions.push(await Quiz.#parseQuestion(guild_id))

                if (!repeats) {
                    questions = [...new Set(questions)]
                }
            }
        }

        return questions
    }

    static async #parseQuestion(guild_id) {
        const questions = await questionController.getAllQuestions(guild_id)
        let id = 0

        for (let i = 0; i < 5; i++) {
            id = randomizer.int(0, questions.length - 1)
        }

        return questions[id]
    }

    static async #showResults(client, channel_id, correct, incorrect) {
        const channel = client.channels.cache.get(channel_id)
        const correctANS = [...new Set(correct)];
        const incorrectANS = [...new Set(incorrect)];

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
            await channel.send({
                content: correctSTR + "\nRight answer! / Правильно!",
            })
        }
        if (incorrectANS.length > 0) {
            await channel.send({
                content: incorrectSTR + "\nWrong answer! / Неправильно!",
            })
        }
    }
}

module.exports = new Quiz()