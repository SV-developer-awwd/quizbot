const connectToDb = require('../mongoconnect');
const serverSchema = require("../schemas/server-schema");
const {createEmbed} = require("../communication/embeds/embeds");
const randomizer = require("random");
const {permsCheck} = require("../communication/permsCheck");
const {
    noResponseError,
    uncaughtError,
    invalidQuestionID,
    operationTerminatedMsg, invalidValueError
} = require("../communication/embeds/error-messages");
const {defaultSuccessMsg} = require("../communication/embeds/success-messages");
const {awaitMessages} = require("../communication/interactions/awaitMessages");
const {chooseOptionMenu} = require("../communication/interactions/chooseOptionMenu");
const {getQIDs} = require("../communication/interactions/getQIDs");
const {confirmActions} = require("../communication/interactions/actionsConfirmation");

const addQuestion = async (robot, mess, args) => {
    if (await permsCheck(mess, "MANAGE_ROLES")) return
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

        let newQuestionID = randomizer.int(10000, 99999)

        let newQuestion = await awaitMessages(mess, {content: "Please write a question / Пожалуйста напишите вопрос"}),
            countOfAnswers = parseInt(await awaitMessages(mess, {content: "Please write count of answers. / Пожалуйста напишите количество ответов для вопроса"})),
            answers = [],
            rightAnswer = 0,
            countOfImages = 0,
            images = []

        if (!newQuestion) {
            await noResponseError(mess)
            return;
        }

        if (isNaN(countOfAnswers)) {
            await invalidValueError(mess)
            return
        }

        for (let i = 0; i < countOfAnswers; i++) {
            const ans = await awaitMessages(mess, {
                content: `Please write ${i === 0 ? "first" : "next"} answer for question /
      Пожалуйста напишите ${
                    i === 0 ? "первый" : "следующий"
                } ответ для вопроса`
            })

            if (!ans) {
                await noResponseError(mess)
                return;
            }

            answers.push(ans)
        }

        rightAnswer = await awaitMessages(mess, {
            content: `Please write the correct answer number for the question /
    Пожалуйста напишите правильный номер ответа для вопроса`
        })

        if (!rightAnswer) {
            await noResponseError(mess)
            return
        }

        countOfImages = await chooseOptionMenu(mess, [
            {
                label: 'No images',
                description: '',
                value: 'zero',
            },
            {
                label: '1',
                description: '',
                value: 'one',
            },
            {
                label: '2',
                description: '',
                value: 'two',
            },
            {
                label: '3',
                description: '',
                value: 'three',
            },
            {
                label: '4',
                description: '',
                value: 'four',
            },
            {
                label: '5',
                description: '',
                value: 'five',
            }
        ], "Please choose count of images for question. / Пожалуйста выберите количество картинок для вопроса. ")

        countOfImages = countOfImages[0]

        switch (countOfImages) {
            case "zero":
                countOfImages = 0;
                break
            case "one":
                countOfImages = 1;
                break
            case "two":
                countOfImages = 2;
                break
            case "three":
                countOfImages = 3;
                break
            case "four":
                countOfImages = 4;
                break
            case "five":
                countOfImages = 5;
                break
            default:
        }

        if (typeof countOfImages !== "number") {
            await noResponseError(mess)
            return
        }

        for (let i = 0; i < countOfImages; i++) {
            let image = await awaitMessages(mess, {
                content: `Please write ${
                    i === 0 ? "first" : "next"
                } link with image. Image must be uploaded to discord as message earlier. /
      Пожалуйста напишите ${
                    i === 0 ? "первую" : "следующую"
                } ссылку с картинкой. Картинка должна быть загружена в виде сообщения в discord ранее.`,
            })
            if (
                image.indexOf("https://media.discordapp.net/attachments/") === -1 ||
                image.length < 42
            ) {
                await mess.channel.send(
                    {content: "Invalid URL to picture. / Невалидная ссылка на картинку"}
                )
            } else {
                images.push(image.split("?")[0]);
            }
        }

        const newQ = {
            questionID: newQuestionID,
            question: newQuestion,
            answer: rightAnswer,
            answers,
            images,
        }

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
                    await createEmbed({
                        title: `Question successfully added.\n Вопрос успешно добавлен.`,
                        author: `ID of question - ${newQuestionID}`,
                    }, mess.guild.id),
                ],
            });
        } catch (e) {
            await uncaughtError(mess)
        }
    }
};

const deleteQuestion = async (robot, mess) => {
    if (await permsCheck(mess, "MANAGE_ROLES")) return
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let questions = res.questions;
    let qIDs = await getQIDs(mess)

    let deleteAll = false
    if (qIDs.indexOf("all") !== -1) {
        deleteAll = true
    }

    if (!deleteAll) {
        for (let i = 0; i < qIDs.length; i++) {
            qIDs[i] = parseInt(qIDs[i])
        }

        if (qIDs.length >= 5) {
            if (await permsCheck(mess, "ADMINISTRATOR")) return
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
        if (await permsCheck(mess, "ADMINISTRATOR")) return

        let clear = await confirmActions(mess)
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
        await defaultSuccessMsg(mess)
    } catch (e) {
        await uncaughtError(mess)
    }
};

const editQuestion = async (robot, mess) => {
    if (await permsCheck(mess, "MANAGE_ROLES")) return
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let questions = res.questions;
    let id = parseInt(await awaitMessages(mess, {content: "Write id of question / Напишите id вопроса"}))
    let question = {};

    for (let q of questions) {
        if (q.questionID === id) {
            question = q;
            break;
        }
    }

    if (isNaN(id) || Object.keys(question).length === 0) {
        await invalidQuestionID(mess)
        return;
    }

    let answers = "";
    for (let i = 0; i < question.answers.length; i++) {
        answers += `${i + 1}. ${question.answers[i]}\n`;
    }

    let param = await chooseOptionMenu(mess, [
        {
            label: "Question / Вопрос",
            description: "Correct the question without rewriting the answers / Исправить вопрос без перезаписи ответов",
            value: "question"
        },
        {
            label: "Right answer / Правильный ответ",
            description: "Change the right answer's number / Изменить номер правильного ответа",
            value: "right_answer"
        },
        {
            label: "Answers / Ответы",
            description: "Rewriting all answers for the question / Перезапись всех ответов для вопроса",
            value: "answers"
        },
        {
            label: "Images / Изображения",
            description: "Rewriting all images' links for the question / Перезапись всех ссылок на изображения для вопроса",
            value: "images"
        }
    ], {
        embeds: [
            await createEmbed({
                title:
                    "Что вы хотите изменить? Напишите название свойства на английском со строчной буквы или --END-- для прекращения процесса / What do you wanna change? Write a property name in lowercase or --END-- to stop the process",
                author: `ID of question - ${question.questionID}`,
                description: `Вопрос / Question - ${question.question}
    Ответы / Answers: \n\`\`\`${answers}\`\`\`
    Правильный ответ / Right answer - ${question.answer}`,
                footer:
                    "Параметры, которые можно изменить / Parameters that can be changed - question, answers, right answer, images",
            }, mess.guild.id),
        ],
        files: question.images,
    })

    if (param === "--END--") {
        await operationTerminatedMsg(mess)
        return;
    }

    switch (param) {
        case "question":
            question.question = await awaitMessages(mess, {content: "Напишите новый вопрос: / Write new question: "})
            break;
        case "right_answer":
            question.answer = parseInt(await awaitMessages(mess, {content: "Напишите номер правильного ответа: / Write right answer number: "}));
            break;
        case "answers":
            let countOfAnswers = await awaitMessages(mess, {
                    content: "Please write count of answers. / Пожалуйста напишите количество ответов для вопроса",
                }),
                answers = [];

            countOfAnswers = parseInt(countOfAnswers)
            if (isNaN(countOfAnswers)) {
                await invalidValueError(mess)
                return
            }

            for (let i = 0; i < countOfAnswers; i++) {
                answers.push(await awaitMessages(mess, {
                    content: `Please write ${
                        i === 0 ? "first" : "next"
                    } answer for question /
          Пожалуйста напишите ${
                        i === 0 ? "первый" : "следующий"
                    } ответ для вопроса`,
                }))
            }
            question.answers = answers;
            question.answer = parseInt(await awaitMessages(mess, {content: "Напишите номер правильного ответа: / Write right answer number: "}));
            break;
        case "images":
            let images = [];
            let countOfImages = await chooseOptionMenu(mess, [
                {
                    label: 'No images',
                    description: '',
                    value: 'zero',
                },
                {
                    label: '1',
                    description: '',
                    value: 'one',
                },
                {
                    label: '2',
                    description: '',
                    value: 'two',
                },
                {
                    label: '3',
                    description: '',
                    value: 'three',
                },
                {
                    label: '4',
                    description: '',
                    value: 'four',
                },
                {
                    label: '5',
                    description: '',
                    value: 'five',
                }
            ], "Please choose count of images for question. / Пожалуйста выберите количество картинок для вопроса. ")

            countOfImages = countOfImages[0]

            switch (countOfImages) {
                case "zero":
                    countOfImages = 0;
                    break
                case "one":
                    countOfImages = 1;
                    break
                case "two":
                    countOfImages = 2;
                    break
                case "three":
                    countOfImages = 3;
                    break
                case "four":
                    countOfImages = 4;
                    break
                case "five":
                    countOfImages = 5;
                    break
                default:
            }

            if (typeof countOfImages === "number") {
                await noResponseError(mess)
                return
            }

            for (let i = 0; i < countOfImages; i++) {
                let image = await awaitMessages(mess, {
                    content: `Please write ${
                        i === 0 ? "first" : "next"
                    } link with image. Image must be uploaded to discord as message earlier. /
      Пожалуйста напишите ${
                        i === 0 ? "первую" : "следующую"
                    } ссылку с картинкой. Картинка должна быть загружена в виде сообщения в discord ранее.`,
                })
                if (
                    image.indexOf("https://media.discordapp.net/attachments/") === -1 ||
                    image.length < 42
                ) {
                    await mess.channel.send(
                        {content: "Invalid URL to picture. / Невалидная ссылка на картинку"}
                    );
                    countOfImages++;
                } else {
                    images.push(image.split("?")[0]);
                }
            }
            question.images = images;
            break;
        default:
            await mess.channel.send({content: "Invalid param / Невалидный параметр"});
            return;
    }

    let isEdit = await confirmActions(mess)

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
        await defaultSuccessMsg(mess)
    } else {
        await operationTerminatedMsg(mess)
    }
};

const showQuestion = async (robot, mess) => {
    if (await permsCheck(mess, "MANAGE_ROLES")) return
    let res = {}
    await connectToDb().then(async mongoose => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
    let questions = res.questions;
    let id = await awaitMessages(mess, `Please write id of question (or "all" to see all) / Пожалуйста напишите id вопроса (или "all", чтобы просмотреть все)`)
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
                await createEmbed({
                    title: "Questions / Вопросы",
                    description: str,
                }, mess.guild.id),
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
        await invalidQuestionID(mess)
        return;
    }

    let answers = "";
    for (let i = 0; i < question.answers.length; i++) {
        answers += `${i + 1}. ${question.answers[i]}\n`;
    }

    await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "1",
                author: `ID of question - ${question.questionID}`,
                description: `Вопрос / Question - ${question.question}
    Ответы / Answers: \n\`\`\`${answers}\`\`\`
    Правильный ответ / Right answer - ${question.answer}`,
            }, mess.guild.id),
        ],
        files: question.images,
    });
}

module.exports = {
    addQuestion,
    deleteQuestion,
    editQuestion,
    showQuestion
};
