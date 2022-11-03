const randomizer = require("random");
const Embeds = require('../functions/Embeds')
const Interactions = require('../functions/Interactions')
const questionController = require("../database/controllers/question.controller")
const {permsCheck} = require("../functions/permsCheck");

class Questions {
    async add(msg, client) {
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 2)) return
        const count = parseInt(await Interactions.awaitMessages(client, msg.channel.id, msg.member.id, {embeds: [await Embeds.create({title: "How many questions do you want to add?"}, msg.guild.id)]}))

        for (let i = 0; i < count; i++) {
            let question = await Interactions.awaitMessages(client, msg.channel.id, msg.member.id, {embeds: [await Embeds.create({title: "Please write a question"}, msg.guild.id)]})
            if (!question) {
                await Embeds.errors.noResponse(client, msg.guild.id, msg.channel.id)
                return
            }

            let answer = await Questions.#getAnswers(client, msg.guild.id, msg.channel.id, msg.member.id, question),
                answer_type = answer.answer_type,
                images = await Questions.#getImages(client, msg.guild.id, msg.channel.id, msg.member.id)
            answer = answer.answers
            images = images.images

            if (!question) {
                await Embeds.errors.noResponse(client, msg.guild.id, msg.channel.id)
                return
            }

            let timestampEnd = JSON.stringify(Date.now()).split("")
            timestampEnd = timestampEnd.slice(timestampEnd.length - 5)
            const id = randomizer.int(100_000, 999_999) + timestampEnd.join("")

            const newQ = {
                question_id: id,
                question,
                answer_type,
                answers: answer,
                images
            }

            try {
                await questionController.createQuestion(msg.guild.id, newQ)

                await msg.channel.send({
                    embeds: [await Embeds.create({
                        title: `Question successfully added`,
                        author: `ID of question - ${newQ.question_id}`,
                    }, msg.guild.id)],
                });
            } catch (e) {
                await Embeds.errors.uncaughtError(client, msg.guild.id, msg.channel.id)
            }
        }
    }

    async delete(msg, client) {
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 2)) return

        if (await questionController.getAllQuestions(msg.guild.id).length < 1) {
            await Embeds.errors.emptyDatabase(client, msg.guild.id, msg.channel.id)
            return
        }

        const qIDs = await Interactions.getQuestionIds(client, msg.guild.id, msg.channel.id, msg.member.id)
        if (qIDs === -1) {
            if (await Interactions.confirmActions(client, msg.guild.id, msg.channel.id)) {
                await questionController.deleteAllQuestions(msg.guild.id)
                await Embeds.success.defaultSuccess(client, msg.guild.id, msg.channel.id)
                return
            }

            await Embeds.errors.operationTerminated(client, msg.guild.id, msg.channel.id)
            return
        }

        try {
            for (let i = 0; i < qIDs.length; i++) {
                await questionController.deleteQuestion(msg.guild.id, qIDs[i])
            }

            await Embeds.success.defaultSuccess(client, msg.guild.id, msg.channel.id)
        } catch (e) {
            await Embeds.errors.uncaughtError(client, msg.guild.id, msg.channel.id)
        }
    }

    async show(msg, client) {
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 2)) {
            return
        }
        const ids = await Interactions.getQuestionIds(client, msg.guild.id, msg.channel.id, msg.member.id)

        if (ids === -1) {
            const questions = await questionController.getAllQuestions(msg.guild.id)
            if (questions.length < 1) {
                await Embeds.errors.emptyDatabase(client, msg.guild.id, msg.channel.id)
                return
            }

            let str = ""

            const sortedQuestions = questions.sort((a, b) =>
                a.question_id > b.question_id ? 1 : -1
            );

            for (let q of sortedQuestions) {
                str += `${q.question_id} - ${q.question}\n`;
            }

            await msg.channel.send({
                embeds: [
                    await Embeds.create({
                        title: "Questions",
                        description: str,
                    }, msg.guild.id),
                ],
            });

            return
        }

        ids.forEach(e => parseInt(e))
        ids.filter(e => !isNaN(e))

        if (ids.length < 1) {
            await Embeds.errors.invalidQuestionId(client, msg.guild.id, msg.channel.id)
            return
        }

        for (let i = 0; i < ids.length; i++) {
            const question = await questionController.getOneQuestion(msg.guild.id, ids[i])

            switch (question.answer_type) {
                case 0:
                    await Questions.#showChoosable(client, msg.guild.id, msg.channel.id, question)
                    break
                case 1:
                    await Questions.#showTypeable(client, msg.guild.id, msg.channel.id, question)
                    break
                default:
            }
        }
    }

    async edit(msg, client) {
        if (!await permsCheck(client, msg.guild.id, msg.channel.id, msg.member, 2)) return

        const id = await Interactions.getQuestionIds(client, msg.guild.id, msg.channel.id, msg.member.id, true)
        const question = await questionController.getOneQuestion(msg.guild.id, id)

        if (!question) {
            await Embeds.errors.invalidQuestionId(client, msg.guild.id, msg.channel.id)
            return
        }

        switch (question.answer_type) {
            case 0:
                await Questions.#showChoosable(client, msg.guild.id, msg.channel.id, question)
                break
            case 1:
                await Questions.#showTypeable(client, msg.guild.id, msg.channel.id, question)
                break
            default:
        }

        const options = [{
            label: "Right answer",
            description: "Change the right answer",
            value: "1"
        },
            {
                label: "Answers",
                description: "Rewriting all answers for the question",
                value: "2"
            },
            {
                label: "Images",
                description: "Rewriting all images' links for the question",
                value: "3"
            },
            {
                label: "Cancel operation",
                value: "0"
            }]

        if (question.answer_type === 1) {
            options.splice(1, 1)
        }

        const param = await Interactions.menu(client, msg.guild.id, msg.channel.id, options,
                {embeds: [await Embeds.create({title: "Please choose the param:"}, msg.guild.id)]}),
            newValue = {}
        switch (param) {
            case 0:
                await Embeds.errors.operationTerminated(client, msg.guild.id, msg.channel.id)
                return
            case 1:
                if (question.answer_type === 1) {
                    newValue.answers = await Questions.#getAnswers(client, msg.guild.id, msg.channel.id, msg.member.id, question.question)
                    newValue.answer_type = newValue.answers.answer_type
                    newValue.answers = newValue.answers.answers
                    break
                }

                newValue.answers = await Questions.#getRightAnswerChoosable(client, msg.guild.id, msg.channel.id, question.answers, question.question)
                break
            case 2:
                newValue.answers = await Questions.#getAnswers(client, msg.guild.id, msg.channel.id, msg.member.id, question.question)
                newValue.answer_type = newValue.answers.answer_type
                newValue.answers = newValue.answers.answers
                break
            case 3:
                newValue.images = await Questions.#getImages(client, msg.guild.id, msg.channel.id, msg.member.id)

                if (newValue.images.images.length < 1 || newValue.images.countOfImages === 0) {
                    await Embeds.errors.operationTerminated(client, msg.guild.id, msg.channel.id)
                    return
                }

                newValue.images = newValue.images.images
                break;
            default:
        }

        const isEdit = await Interactions.confirmActions(client, msg.guild.id, msg.channel.id)

        if (isEdit) {
            await questionController.updateQuestion(msg.guild.id, id, newValue)

            await Embeds.success.defaultSuccess(client, msg.guild.id, msg.channel.id)
        }
    }

    static async #getAnswers(client, guild_id, channel_id, member_id, question) {
        const answer_type = parseInt(await Interactions.menu(client, guild_id, channel_id, [
            {
                label: "Choosable answers",
                description: "User should choose one of answer",
                value: "0"
            }, {
                label: "Typeable answer",
                description: "User should type answer using keyboard",
                value: "1"
            }], {embeds: [await Embeds.create({title: "Please choose the type of answer:"}, guild_id)]}
        ))

        const answer = {}
        switch (answer_type) {
            case 0:
                const countOfAnswers = await Interactions.menu(client, guild_id, channel_id, [
                    {label: "2", value: "2"},
                    {label: "3", value: "3"},
                    {label: "4", value: "4"},
                    {label: "5", value: "5"},
                    {label: "6", value: "6"},
                    {label: "7", value: "7"},
                    {label: "8", value: "8"},
                    {label: "9", value: "9"},
                    {label: "10", value: "10"}
                ], {embeds: [await Embeds.create({title: "Please choose count of answers: "}, guild_id)]})

                for (let i = 0; i < countOfAnswers; i++) {
                    const ans = await Interactions.awaitMessages(client, channel_id, member_id, {
                        embeds: [
                            await Embeds.create({title: `Please write ${i === 0 ? "first" : "next"} answer for question`}, guild_id)
                        ]
                    })

                    if (!ans) {
                        await Embeds.errors.noResponse(client, guild_id, channel_id)
                        return;
                    }

                    answer[i] = ans
                }

                answer.rightChoosable = await Questions.#getRightAnswerChoosable(client, guild_id, channel_id, answer, question)

                if (!answer.rightChoosable) {
                    await Embeds.errors.noResponse(client, guild_id, channel_id)
                    return
                }
                break
            case 1:
                answer.typeable = await Interactions.awaitMessages(client, channel_id, member_id, {
                    embeds: [await Embeds.create({title: `Please write the right answer for the question:`}, guild_id)]
                })
                break
            default:
        }

        return {answer_type, answers: answer}
    }

    static async #getImages(client, guild_id, channel_id, member_id) {
        const images = []

        const countOfImages = parseInt(await Interactions.menu(client, guild_id, channel_id, [{
            label: 'No images', description: '', value: '0',
        }, {
            label: '1', description: '', value: '1',
        }, {
            label: '2', description: '', value: '2',
        }, {
            label: '3', description: '', value: '3',
        }, {
            label: '4', description: '', value: '4',
        }, {
            label: '5', description: '', value: '5',
        }], {embeds: [await Embeds.create({title: "Please choose count of images for question"}, guild_id)]}))


        for (let i = 0; i < countOfImages; i++) {
            let image = await Interactions.awaitMessages(client, channel_id, member_id, {
                embeds: [await Embeds.create({title: `Please write ${i === 0 ? "first" : "next"} link with image. Image must be uploaded to discord as message earlier`}, guild_id)]
            })

            if (image.indexOf("https://media.discordapp.net/attachments/") === -1 || image.length < 42) {
                await Embeds.errors.invalidImageUrl(client, guild_id, channel_id)
            } else {
                images.push(image.split("?")[0]);
            }
        }

        return {images, countOfImages}
    }

    static async #getRightAnswerChoosable(client, guild_id, channel_id, answers, question) {
        let options = []
        for (const key of Object.keys(answers)) {
            if (key === "rightChoosable") {
                continue
            }

            options.push({
                label: answers[key],
                value: JSON.stringify(Object.keys(answers).indexOf(key))
            })
        }

        return await Interactions.menu(client, guild_id, channel_id, options, {
            embeds: [await Embeds.create({
                title: "Choose the right answer for question:",
                description: question
            }, guild_id)]
        })
    }

    static async #showChoosable(client, guild_id, channel_id, question) {
        const channel = client.channels.cache.get(channel_id)
        let ans = ""
        for (const key of Object.keys(question.answers)) {
            if (key === "rightChoosable") {
                ans += `Right answer: ${question.answers.rightChoosable + 1}`
                continue
            }

            ans += `${parseInt(key) + 1}: ${question.answers[key]}\n`
        }

        await channel.send({
            embeds: [
                await Embeds.create({
                    title: `${question.question}`,
                    author: `ID of question - ${question.question_id}`,
                    description: `Answers: \n\`\`\`${ans}\`\`\``,
                }, guild_id),
            ],
            files: question.images,
        });
    }

    static async #showTypeable(client, guild_id, channel_id, question) {
        const channel = client.channels.cache.get(channel_id)

        await channel.send({
            embeds: [
                await Embeds.create({
                    title: `${question.question}`,
                    author: `ID of question - ${question.question_id}`,
                    description: `Answer: \n\`\`\`${question.answers.typeable}\`\`\``,
                }, guild_id),
            ],
            files: question.images,
        });
    }
}

module.exports = new Questions()
