const connectToDb = require('../mongoconnect');
const serverSchema = require("../schemas/server-schema");
const {createEmbed} = require("../communication/embeds");
const {updateLB} = require("./leaderboard");
const {Permissions} = require("discord.js");
const randomizer = require("random");
const validator = require("validator");

const addQuestion = async (robot, mess, args) => {
    if (
        !mess.member.permissions.has(
            Permissions.FLAGS.MANAGE_ROLES
        )
    ) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }
    const count = args[1] !== "" ? parseInt(args[1]) : 1

    for (let i = 0; i < count; i++) {
        let res = {}
        await connectToDb().then(async mongoose => {
            try {
                res = await serverSchema.findOne({server: mess.guild.id})
            } finally {
                await mongoose.endSession()
            }
        })
        let questions = res.questions;

        let newQuestionID = randomizer.int(10000, 99999),
            uniqueID = false;
        const questionIDs = res.questionIDs;

        while (!uniqueID) {
            if (questionIDs.indexOf(newQuestionID) !== -1) {
                newQuestionID = randomizer.int(10000, 99999);
            } else {
                questionIDs.push(newQuestionID);
                uniqueID = true;
            }
        }

        let countOfAnswers = 0,
            answers = [],
            countOfImages = 0,
            images = [],
            newQuestion = "",
            end = false;

        await mess.channel.send({
            content: "Please write a question / Пожалуйста напишите вопрос",
        });
        await mess.channel
            .awaitMessages({
                filter: () => mess.content,
                max: 1,
                time: 30000,
                errors: ["time"],
            })
            .then((collected) => {
                newQuestion = collected.first().content;
            })
            .catch(() => {
                end = true
            });

        if (end) {
            await mess.channel.send(
                "Unfortunately, due to lack of response, the operation was canceled. / К сожалению из-за отсутствия ответа операция была прервана."
            );
            return;
        }

        await mess.channel.send({
            content:
                "Please write count of answers. / Пожалуйста напишите количество ответов для вопроса",
        });
        await mess.channel
            .awaitMessages({
                filter: () => mess.content,
                max: 1,
                time: 30000,
                errors: ["time"],
            })
            .then((collected) => {
                countOfAnswers = collected.first().content;
            })
            .catch(() => {
                end = true
            });

        if (end) {
            await mess.channel.send(
                "Unfortunately, due to lack of response, the operation was canceled. / К сожалению из-за отсутствия ответа операция была прервана."
            );
            return;
        }

        for (let i = 0; i < countOfAnswers; i++) {
            await mess.channel.send({
                content: `Please write ${i === 0 ? "first" : "next"} answer for question /
      Пожалуйста напишите ${
                    i === 0 ? "первый" : "следующий"
                } ответ для вопроса`,
            });
            await mess.channel
                .awaitMessages({
                    filter: () => mess.content,
                    max: 1,
                    time: 30000,
                    errors: ["time"],
                })
                .then((collected) => {
                    answers.push(collected.first().content);
                })
                .catch(() => {
                    end = true
                });
            if (end) {
                await mess.channel.send(
                    "Unfortunately, due to lack of response, the operation was canceled. / К сожалению из-за отсутствия ответа операция была прервана."
                );
                return;
            }
        }

        let rightAnswer = 0;

        await mess.channel.send({
            content: `Please write the correct answer number for the question /
    Пожалуйста напишите правильный номер ответа для вопроса`,
        });
        await mess.channel
            .awaitMessages({
                filter: () => mess.content,
                max: 1,
                time: 30000,
                errors: ["time"],
            })
            .then((collected) => {
                rightAnswer = parseInt(collected.first().content);
            }).catch(() => {
                end = true
            })

        if (end) {
            await mess.channel.send("Unfortunately, due to lack of response, the operation was canceled. / К сожалению из-за отсутствия ответа операция была прервана.")
            return
        }

        await mess.channel.send({
            content:
                "Please write count of images for question. Write 0 if you don't want to attach images. / Пожалуйста напишите количество картинок для вопроса. Напишите 0, если не хотите прикреплять картинки",
        });
        await mess.channel
            .awaitMessages({
                filter: () => mess.content,
                max: 1,
                time: 30000,
                errors: ["time"],
            })
            .then((collected) => {
                countOfImages = collected.first().content;
            }).catch(() => {
                end = true
            })
        if (end) {
            await mess.channel.send("Unfortunately, due to lack of response, the operation was canceled. / К сожалению из-за отсутствия ответа операция была прервана.")
            return
        }

        for (let i = 0; i < countOfImages; i++) {
            await mess.channel.send({
                content: `Please write ${
                    i === 0 ? "first" : "next"
                } link with image. Image must be uploaded to discord as message earlier. /
      Пожалуйста напишите ${
                    i === 0 ? "первую" : "следующую"
                } ссылку с картинкой. Картинка должна быть загружена в виде сообщения в discord ранее.`,
            });
            await mess.channel
                .awaitMessages({
                    filter: () => mess.content,
                    max: 1,
                    time: 30000,
                    errors: ["time"],
                })
                .then(async (collected) => {
                    let image = collected.first().content;

                    if (
                        image.indexOf("https://media.discordapp.net/attachments/") === -1 ||
                        image.length < 42
                    ) {
                        await mess.channel.send(
                            "Invalid URL to picture. / Невалидная ссылка на картинку"
                        );
                        countOfImages++;
                    } else {
                        images.push(image.split("?")[0]);
                    }
                }).catch(() => {
                    end = true
                })

            if (end) {
                await mess.channel.send("Unfortunately, due to lack of response, the operation was canceled. / К сожалению из-за отсутствия ответа операция была прервана.")
                return
            }
        }

        const newQ = {
            questionID: newQuestionID,
            question: newQuestion,
            answer: rightAnswer,
            answers,
            images,
        };

        questions.push(newQ);

        questions = questions.filter((question) => question !== null);

        try {
            await connectToDb().then(async mongoose => {
                try {
                    await serverSchema.updateOne({server: mess.guild.id}, {questions})
                } finally {
                    await mongoose.endSession()
                }
            })
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: `Question successfully added.\n Вопрос успешно добавлен.`,
                        author: `ID of question - ${newQuestionID}`,
                    }),
                ],
            });
        } catch (e) {
            await mess.channel.send({
                content: `Uncaught Error, try again please.
    Ошибка! Попробуйте еще раз.`,
            });
        }
    }
};

const deleteQuestion = async (robot, mess, args) => {
    if (
        !mess.member.permissions.has(
            Permissions.FLAGS.MANAGE_ROLES
        )
    ) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let questions = res.questions;
    let qIDs = args;
    qIDs.pop()
    qIDs.shift();

    let deleteAll = false
    if(qIDs.indexOf("all") !== -1) {
        deleteAll = true
    }

    if (!deleteAll) {
        for (let i = 0; i < qIDs.length; i++) {
            qIDs[i] = parseInt(qIDs[i])
        }

        if (qIDs.length >= 5) {
            if (
                !mess.member.permissions.has(
                    Permissions.FLAGS.ADMINISTRATOR
                )
            ) {
                await mess.channel.send({
                    content: "No permissions to use this command! / Недостаточно прав!",
                });
                return;
            }
        }

        for (let q of questions) {
            if (q === null) {
                continue;
            }

            if (qIDs.indexOf(q.questionID) !== -1) {
                delete questions[questions.indexOf(q)];
            }
        }
    } else {
        if (
            !mess.member.permissions.has(
                Permissions.FLAGS.ADMINISTRATOR
            )
        ) {
            await mess.channel.send({
                content: "No permissions to use this command! / Недостаточно прав!",
            });
            return;
        }

        let clear = false
        await mess.channel.send({
            content:
                "Do you really wanna delete all questions? You cannot undo it. Write TRUE if you really wanna do it / Вы реально хотите удалить все вопросы? Это действие невозможно отменить. Напишите TRUE, если вы реально хотите это сделать",
        });
        await mess.channel
            .awaitMessages({
                filter: () => mess.content,
                time: 30000,
                max: 1,
                errors: ["time"],
            })
            .then((collected) => {
                if (collected.first().content.toLowerCase() === "true") {
                    clear = true;
                }
            }).catch(() => clear = false)

        if (clear) {
            questions = []
        }
    }

    try {
        await connectToDb().then(async mongoose => {
            try {
                await serverSchema.updateOne({server: mess.guild.id}, {questions})
            } finally {
                await mongoose.endSession()
            }
        })
        await mess.channel.send({
            embeds: [
                createEmbed({
                    title: `Question(s) successfully deleted.\n Вопрос(ы) успешно удален(ы).`,
                }),
            ],
        });
    } catch (e) {
        await mess.channel.send({
            content: `Uncaught Error, try again please.
      Ошибка! Попробуйте еще раз.`,
        });
    }
};

const getQuestion = async (mess, specialIDS) => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let questions = res.questions;
    questions = questions.filter((question) => question !== null)

    if (specialIDS.onlyQuestions.length < 1  && specialIDS.exclude.length < 1) {
        //no -only or -exclude
        return questions[randomizer.int(0, questions.length)]
    } else if (specialIDS.onlyQuestions.length >= 1 && specialIDS.exclude.length < 1) {
        // -only
        let questionsArr = []
        for (let i = 0; i < questions.length; i++) {
            if (specialIDS.onlyQuestions.indexOf(questions[i].questionID) !== -1) {
                questionsArr.push(questions[i])
            }
        }

        return questionsArr[randomizer.int(0, questions.length)]
    } else if (specialIDS.onlyQuestions.length < 1 && specialIDS.exclude.length >= 1) {
        // -exclude
        const q = questions[randomizer.int(0, questions.length)]
        if (specialIDS.exclude.indexOf(q.questionID) !== -1) {
            return getQuestion(mess, specialIDS)
        }

        return q
    }
};

const askQuestion = async (mess, gameID, onlyQuestions, exclude) => {
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let timeout = res.questionTimeout

    const specialIDS = {
        onlyQuestions, exclude
    }

    let question = await getQuestion(mess, specialIDS),
        answers = [],
        notOK = true

    do {
        try {
            answers = question.answers;
            notOK = false
        } catch (e) {
            question = await getQuestion(mess, specialIDS)
            notOK = true
        }
    } while (notOK)

    let answersSTR = ``;

    for (let i = 1; i <= answers.length; i++) {
        answersSTR += `\n${i}. ${answers[i - 1]}`;
    }

    await mess.channel.send({
        embeds: [
            createEmbed({
                title: question.question,
                author: `ID of question - ${question.questionID}`,
                description: answersSTR
            }),
        ],
        files: question.images
    });

    let usersAnswers = {};
    let isGameOver = false;
    let arr = [];

    await mess.channel.send({
        content: `Write number of answer. You have ${
            timeout / 1000
        } seconds to answer. / Напишите номер ответа. У вас есть ${
            timeout / 1000
        } секунд, чтобы ответить.`,
    });
    await mess.channel
        .awaitMessages({
            filter: () => mess.content,
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
        mess.channel.send("Game over / Игра окончена");
        return new Error("game over");
    }
    await mess.channel.send(
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
        await mess.channel.send(
            `Unfortunately, no one gave the correct answer, but this was the answer number ${question.answer} / К сожалению никто не дал правильный ответ, а это был ответ номер ${question.answer}`
        );
        return "";
    }

    for (let i = 0; i < correctANS.length; i++) {
        await updateLB(mess, correctANS[i], 1);
    }

    correctANS = [...new Set(correctANS)];
    incorrectANS = [...new Set(incorrectANS)];

    let correctSTR = "";
    for (let i = 0; i < correctANS.length; i++) {
        correctSTR += `<@${correctANS[i]}> `;

        if (i >= 10) {
            correctSTR += `+${correctANS.length-10} users`
            break
        }
    }

    let incorrectSTR = "";
    for (let i = 0; i < incorrectANS.length; i++) {
        incorrectSTR += `<@${incorrectANS[i]}> `;

        if (i >= 10) {
            incorrectSTR += `+${incorrectANS.length-10} users`
            break
        }
    }

    if (correctANS.length > 0) {
        await mess.channel.send({
            content: correctSTR + "\nRight answer! / Правильно!",
        });
    }
    if (incorrectANS.length > 0) {
        await mess.channel.send({
            content: incorrectSTR + "\nWrong answer! / Неправильно!",
        });
    }

    return "";
};

const editQuestion = async (robot, mess, args) => {
    if (
        !mess.member.permissions.has(
            Permissions.FLAGS.MANAGE_ROLES
        )
    ) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let questions = res.questions;
    let id = parseInt(args[1]);
    let question = {};

    for (let q of questions) {
        if (q.questionID === id) {
            question = q;
            break;
        }
    }

    if (isNaN(id) || Object.keys(question).length === 0) {
        await mess.channel.send("Невалидный id вопроса! / Invalid id of question!");
        return;
    }

    let answers = "";
    for (let i = 0; i < question.answers.length; i++) {
        answers += `${i + 1}. ${question.answers[i]}\n`;
    }

    let param = "",
        newValue = "";
    await mess.channel.send({
        embeds: [
            createEmbed({
                title:
                    "Что вы хотите изменить? Напишите название свойства на английском со строчной буквы или --END-- для прекращения процесса / What do you wanna change? Write a property name in lowercase or --END-- to stop the process",
                author: `ID of question - ${question.questionID}`,
                description: `Вопрос / Question - ${question.question}
    Ответы / Answers: \n\`\`\`${answers}\`\`\`
    Правильный ответ / Right answer - ${question.answer}`,
                footer:
                    "Параметры, которые можно изменить / Parameters that can be changed - question, answers, right answer, images",
            }),
        ],
        files: question.images,
    });
    await mess.channel
        .awaitMessages({
            filter: () => mess.content,
            max: 1,
            time: 300000000,
            errors: ["time"],
        })
        .then((collected) => {
            param = collected.first().content;
        })
        .catch(() => {
            param = "--END--";
        });

    if (param === "--END--") {
        await mess.channel.send("Операция остановлена / Operation terminated");
        return;
    }

    switch (param) {
        case "question":
            await mess.channel.send("Напишите новый вопрос: / Write new question: ");
            await mess.channel
                .awaitMessages({
                    filter: () => mess.content,
                    time: 30000000,
                    max: 1,
                    errors: ["time"],
                })
                .then((collected) => {
                    newValue = collected.first().content;
                });
            question.question = newValue;
            break;
        case "right answer":
            await mess.channel.send(
                "Напишите номер правильного ответа: / Write right answer number: "
            );
            await mess.channel
                .awaitMessages({
                    filter: () => mess.content,
                    time: 30000000,
                    max: 1,
                    errors: ["time"],
                })
                .then((collected) => {
                    newValue = collected.first().content;
                });
            question.answer = parseInt(newValue);
            break;
        case "answers":
            let countOfAnswers = 0,
                answers = [];
            await mess.channel.send({
                content:
                    "Please write count of answers. / Пожалуйста напишите количество ответов для вопроса",
            });
            await mess.channel
                .awaitMessages({
                    filter: () => mess.content,
                    max: 1,
                    time: 300000000,
                    errors: ["time"],
                })
                .then((collected) => {
                    countOfAnswers = collected.first().content;
                });

            for (let i = 0; i < countOfAnswers; i++) {
                await mess.channel.send({
                    content: `Please write ${
                        i === 0 ? "first" : "next"
                    } answer for question /
          Пожалуйста напишите ${
                        i === 0 ? "первый" : "следующий"
                    } ответ для вопроса`,
                });
                await mess.channel
                    .awaitMessages({
                        filter: () => mess.content,
                        max: 1,
                        time: 300000000,
                        errors: ["time"],
                    })
                    .then((collected) => {
                        answers.push(collected.first().content);
                    });
            }
            question.answers = answers;

            await mess.channel.send(
                "Напишите номер правильного ответа: / Write right answer number: "
            );
            await mess.channel
                .awaitMessages({
                    filter: () => mess.content,
                    time: 30000000,
                    max: 1,
                    errors: ["time"],
                })
                .then((collected) => {
                    newValue = collected.first().content;
                });
            question.answer = parseInt(newValue);
            break;
        case "images":
            let countOfImages = 0,
                images = [];
            await mess.channel.send({
                content:
                    "Please write count of images for question. Write 0 if you don't want to attach images. Please note that all old pictures will be deleted / Пожалуйста напишите количество картинок для вопроса. Напишите 0, если не хотите прикреплять картинки. Учитывайте, что все старые картинки будут удалены",
            });
            await mess.channel
                .awaitMessages({
                    filter: () => mess.content,
                    max: 1,
                    time: 300000000,
                    errors: ["time"],
                })
                .then((collected) => {
                    countOfImages = collected.first().content;
                });

            for (let i = 0; i < countOfImages; i++) {
                await mess.channel.send({
                    content: `Please write ${
                        i === 0 ? "first" : "next"
                    } link with image. /
        Пожалуйста напишите ${
                        i === 0 ? "первую" : "следующую"
                    } ссылку с картинкой.`,
                });
                await mess.channel
                    .awaitMessages({
                        filter: () => mess.content,
                        max: 1,
                        time: 300000000,
                        errors: ["time"],
                    })
                    .then((collected) => {
                        images.push(collected.first().content);
                    });
            }
            question.images = images;
            break;
        default:
            await mess.channel.send("Invalid param / Невалидный параметр");
            return;
    }

    let isEdit = false;
    await mess.channel.send({
        content:
            "Вы уверены, что хотите изменить вопрос? Это действие будет невозможно отменить. Напишите 1, если да. / Do you really wanna update the question? You cannot undo it. Write 1 if yes",
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
                isEdit = true;
            }
        });

    if (isEdit) {
        for (let q of questions) {
            if (q.questionID === id) {
                q = question;
                break;
            }
        }
        await connectToDb().then(async mongoose => {
            try {
                await serverSchema.updateOne({server: mess.guild.id}, {questions})
            } finally {
                await mongoose.endSession()
            }
        })
        await mess.channel.send({content: "Успех! / Success!"});
    } else {
        await mess.channel.send("Операция остановлена / Operation terminated");
    }
};

const showQuestion = async (robot, mess, args) => {
    if (
        !mess.member.permissions.has(
            Permissions.FLAGS.MANAGE_ROLES
        )
    ) {
        await mess.channel.send({
            content: "No permissions to use this command! / Недостаточно прав!",
        });
        return;
    }
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let questions = res.questions;
    let id = args[1]
    let question = {};

    if (id === "all") {
        let str = "";

        questions = questions.filter(q => q !== null)

        const sortedQuestions = questions.sort((a, b) =>
            a.questionID > b.questionID ? 1 : -1
        );

        for (let q of sortedQuestions) {
            str += `${q.questionID} - ${q.question}\n`;
        }

        await mess.channel.send({
            embeds: [
                createEmbed({
                    title: "Questions / Вопросы",
                    description: str,
                }),
            ],
        });

        return
    }

    id = parseInt(id)

    for (let q of questions) {
        if (q === null) {
            continue;
        }

        if (q.questionID === id) {
            question = q;
            break;
        }
    }

    if (isNaN(id) || Object.keys(question).length === 0) {
        await mess.channel.send("Невалидный id вопроса! / Invalid id of question!");
        return;
    }

    let answers = "";
    for (let i = 0; i < question.answers.length; i++) {
        answers += `${i + 1}. ${question.answers[i]}\n`;
    }

    await mess.channel.send({
        embeds: [
            createEmbed({
                title: "1",
                author: `ID of question - ${question.questionID}`,
                description: `Вопрос / Question - ${question.question}
    Ответы / Answers: \n\`\`\`${answers}\`\`\`
    Правильный ответ / Right answer - ${question.answer}`,
            }),
        ],
        files: question.images,
    });
}

module.exports = {
    addQuestion,
    deleteQuestion,
    getQuestion,
    askQuestion,
    editQuestion,
    showQuestion
};
