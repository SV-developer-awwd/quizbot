const {createEmbed} = require("../communication/embeds/embeds");
const Discord = require("discord.js");
const connectToDb = require("../mongoconnect");
const serverSchema = require("../schemas/server-schema");

const botinfo = async (robot, mess) => {
    let res = {}
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })

    const prefix = res.prefix ?? "q!"

    await mess.channel.send({
        embeds: [
            await createEmbed({
                title: "Information about the bot / Инфорамция о боте",
                description: `**Developed by / Разработал** - @TS prog#3919
      **Prefix / Префикс** - ${prefix}
      **Help command / Команда справки** - ${prefix}help`
            }, mess.guild.id),
        ],
    });
};

const help = async (robot, mess) => {
    let res = {}
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })

    const prefix = res.prefix ?? "q!"

    await mess.channel.send({
        embeds: [
            new Discord.MessageEmbed()
                .setColor("#0000ff")
                .setTitle("Bot commands / Команды бота")
                .setDescription(
                    "All commands of the bot are presented here. Some of them may be unavailable due to lack of appropriate rights. For detailed help on a command, write ```q!command rules``` replacing the \"rules\" with the desired command  \n Здесь представлены все команды бота. Некоторые из них могут быть недоступны из-за отсутствия соответствующих прав. Для просмотра подробной справки по команде напишите ```q!command rules```, заменив rules на нужную команду."
                )
                .addFields([
                    {
                        name: "**Game rules / Правила игры**",
                        value: `\`\`\`${prefix}rewrite\`\`\` \`\`\`${prefix}rules\`\`\` \`\`\`${prefix}addrule\`\`\``,
                        inline: true,
                    },
                    {
                        name: "Game limiter / Ограничитель игр",
                        value: `\`\`\`${prefix}maxgames\`\`\` \`\`\`${prefix}cleargames\`\`\` \`\`\`${prefix}gamescount\`\`\``,
                        inline: true
                    },
                    {
                        name: "**Help / Справка**",
                        value: `\`\`\`${prefix}help\`\`\` \`\`\`${prefix}botinfo\`\`\` \`\`\`${prefix}command\`\`\``,
                        inline: true,
                    },
                    {
                        name: "**Questions / Вопросы **",
                        value:
                            `\`\`\`${prefix}add\`\`\` \`\`\`${prefix}delete\`\`\` \`\`\`${prefix}edit\`\`\` \`\`\`${prefix}show\`\`\``,
                        inline: true,
                    },
                    {
                        name: "**Bot settings / Настройки бота**",
                        value:
                            `\`\`\`${prefix}settings\`\`\` \`\`\`${prefix}update\`\`\``,
                        inline: true,
                    },
                    {
                        name: "**Leaderboard / Лидерборд**",
                        value: `\`\`\`${prefix}lb\`\`\` \`\`\`${prefix}clearLB\`\`\``,
                        inline: true,
                    },
                    {
                        name: "**Game / Игра**",
                        value: `\`\`\`${prefix}game\`\`\``,
                        inline: true,
                    },
                    {
                        name: "Other / Другое",
                        value: `\`\`\`${prefix}export\`\`\`  \`\`\`${prefix}reset\`\`\``,
                        inline: true
                    }
                ]),
        ],
    });
};

const commandHelp = async (robot, mess, args) => {
    let res = {}
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: mess.guild.id})
        } finally {
            await mongoose.endSession()
        }
    })

    const prefix = res.prefix ?? "q!"
    const command = args[1];

    switch (command) {
        case "rewriterules":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}rewrite`,
                        description: `**Syntax / Синтаксис** - "${prefix}rewrite <rules>"
      **<rules>** - new rules / новые правила
      **Appointment / Назначение** - setting new game rules / установка новых правил игры
      **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "rules":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}rules`,
                        description: `**Syntax / Синтаксис** - "${prefix}rules"
      **Appointment / Назначение** - showing the rules of the game/ показ правил игры
      **Minimal permissions / Минимальные права** - none`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "help":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}help`,
                        description: `**Syntax / Синтаксис** - "${prefix}help"
      **Appointment / Назначение** - help / справка
      **Minimal permissions / Минимальные права** - none`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "botinfo":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}botinfo`,
                        description: `**Syntax / Синтаксис** - "${prefix}botinfo"
      **Appointment / Назначение** - bot information / информация о боте
      **Minimal permissions / Минимальные права** - none`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "command":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}command`,
                        description: `**Syntax / Синтаксис** - "${prefix}command <command>"
        **<command>** - get help about command / получить справку о команде
        **Appointment / Назначение** - help / справка
        **Minimal permissions / Минимальные права** - none`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "game":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}game`,
                        description: `**Syntax / Синтаксис** - "${prefix}game <flag>"
      <flag> - condition with which the game can start. Optional argument (you can omit it). In order to find out what the conditions are, write "${prefix}command game-flags" / условие с которым может стартовать игра. Необязательный аргумент (можно не писать). Для того, чтобы узнать какие имеются условия напишите "${prefix}command game-flags"
      **Appointment / Назначение** - starting a game / стартует игру
      **Minimal permissions / Минимальные права** - none`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "game-flags":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `Flags for q!game`,
                        description: `__**-y, -yes**__ = agree with the rules (the bot will not ask the corresponding question) / согласен(а) с правилами (бот не будет задавать соответствующего вопроса)
                        
                        __**-ex, -exclude**__ = exclude some questions from the game (id of questions are indicated later) / исключить некоторые вопросы из игры (id вопросов указываются позже)
                        
                        __**-only**__ = make a game only from certain questions (id will be indicated later). Attention, there is a high probability of frequent repetition of questions! / составить игру только из определенных вопросов (id указываются позже). Внимание, высока вероятность частого повтора вопросов!
                        
                        __**-th, -threads**__ = threads mode (the game is played not in the channel, but in the branches) / режим веток (игра проводится не в канале, а в ветках)
                        
                        **_Note: Using the -ex(-exclude) flags significantly reduces the likelihood of the specified question(s) being dropped, but does not exclude it (them)!
                        Примечание: использование флагов -ex(-exclude) значительно уменьшает вероятность выпадения указанного вопроса(ов), но не исключает его(их)!_**
                        `,
                    }, mess.guild.id),
                ],
            });
            break;
        case "lb":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}lb`,
                        description: `**Syntax / Синтаксис** - "${prefix}lb"
      **Appointment / Назначение** - show leaderboard / показывает лидерборд
      **Minimal permissions / Минимальные права** - none`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "clearLB":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}clearLB`,
                        description: `**Syntax / Синтаксис** - "${prefix}clearLB <user>"
      <user> - the user whose data on the leaderboard is deleted (all for all users) / пользователь, данные которого на лидерборде удаляются (all для всех пользователей)
      **Appointment / Назначение** - permanent cleaning of the leaderboard / безвозвратная очистка лидерборда
      **Minimal permissions / Минимальные права** - ADMINISTRATOR`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "delete":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}delete`,
                        description: `**Syntax / Синтаксис** - "${prefix}delete <id>"
      **<id>** - question id / id вопроса
      **Appointment / Назначение** - deleting question from db / удаление вопроса из базы
      **Minimal permissions / Минимальные права** - MANAGE_ROLES for deleting 1-4 questions at 1 time & ADMINISTRATOR for deleting 5+ questions at 1 time`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "add":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}add`,
                        description: `**Syntax / Синтаксис** - "${prefix}add <count>"
      <count> - the number of questions to add at a time (without calling the command again) / количество вопросов, которые надо добавить за 1 раз (без повторного вызова команды)
      **Appointment / Назначение** - add question to db / добавление вопроса в базу
      **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "edit":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}edit`,
                        description: `**Syntax / Синтаксис** - "${prefix}edit <id>"
        **<id>** - question id / id вопроса
        **Appointment / Назначение** - editing already added question / изменение уже добавленного вопроса
        **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "show":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}show`,
                        description: `**Syntax / Синтаксис** - "${prefix}show <id>"
**<id>** - question id or "all" to see all questions / id вопроса или "all", чтобы увидеть все вопросы
**Appointment / Назначение** - showing the question in preview mode / показ вопроса в режиме предпросмотра
**Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }, mess.guild.id),
                ],
            })
            break;
        case "maxgames":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}maxgames`,
                        description: `**Syntax / Синтаксис** - "${prefix}maxgames"
          **Appointment / Назначение** - setting the parameter of the maximum running games by 1 person per day / установка параметра максимально запущенных игр 1 человеком в день
          **Minimal permissions / Минимальные права** - ADMINISTRATOR`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "addrule":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}addrule`,
                        description: `**Syntax / Синтаксис** - "${prefix}addrule <rule>"
          **<rule>** - new rule to be added / новое правило, которое надо добавить
          **Appointment / Назначение** - updating rules / обновление правил
          **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "cleargames":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}cleargames`,
                        description: `**Syntax / Синтаксис** - "${prefix}cleargames <user>"
          **<user>** - the person whose games information needs to be deleted (ping or "all" to clear the entire list)/ человек, инфу по играм которого надо удалить (пинг или "all" для очистки всего списка)
          **Appointment / Назначение** - clearing games list for game limiter / очистка списка игр для ограничителя игр
          **Minimal permissions / Минимальные права** - ADMINISTRATOR`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "gamescount":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}gamescount`,
                        description: `**Syntax / Синтаксис** - "${prefix}gamescount"
          **Appointment / Назначение** - show started games by user / показ начатых игр игроком
          **Minimal permissions / Минимальные права** - none`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "export":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}export`,
                        description: `**Syntax / Синтаксис** - "${prefix}export"
          **Appointment / Назначение** - export questions from the database to a .txt file / экспорт  вопросов из базы в файл .txt
          **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }, mess.guild.id),
                ],
            });
            break;
        case "settings":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}settings`,
                        description: `**Syntax / Синтаксис** - "${prefix}settings"
          **Appointment / Назначение** - show current bot settings / показ текущих настроек бота
          **Minimal permissions / Минимальные права** - MANAGE_ROLES`
                    }, mess.guild.id)
                ]
            })
            break
        case "reset":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}reset`,
                        description: `**Syntax / Синтаксис** - "${prefix}reset"
          **Appointment / Назначение** - resets bot settings to standard (it will also delete all questions and rules, clear the leaderboard) / сбрасывает настройки бота до стандартных (это также удалит все вопросы и правила, очистит лидерборд)
          **Minimal permissions / Минимальные права** - ADMINISTRATOR`
                    })
                ]
            })
            break
        case "update":
            await mess.channel.send({
                embeds: [
                    await createEmbed({
                        title: `${prefix}update`,
                        description: `**Syntax / Синтаксис** - "${prefix}update"
          **Appointment / Назначение** - updates bot settings / обновляет правила сервера
          **Minimal permissions / Минимальные права** - MANAGE_ROLES`
                    }, mess.guild.id)
                ]
            })
            break
        default:
            await mess.channel.send({
                content: "Command not found / Команда не найдена",
            });
    }
};

module.exports = {botinfo, help, commandHelp};
