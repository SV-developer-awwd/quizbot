const {createEmbed} = require("../communication/embeds");
const Discord = require("discord.js");

const botinfo = (robot, mess) => {
    mess.channel.send({
        embeds: [
            createEmbed({
                title: "Information about the bot / Инфорамция о боте",
                description: `**Developed by / Разработал** - @TS prog#1121
      **Prefix / Префикс** - q!
      **Help command / Команда справки** - q!help`
            }),
        ],
    });
};

const help = (robot, mess) => {
    mess.channel.send({
        embeds: [
            new Discord.MessageEmbed()
                .setColor("#0000ff")
                .setTitle("Bot commands / Команды бота")
                .setDescription(
                    "All commands of the bot are presented here. Some of them may be unavailable due to lack of appropriate rights. For detailed help on a command, write ```q!command rules``` replacing the \"rules\" with the desired command  \n Здесь представлены все команды бота. Некоторые из них могут быть недоступны из-за отсутствия соответствующих прав. Для просмотра подробной справки по команде напишите ```q!command rules```, заменив rules на нужную команду."
                )
                .addFields([
                    {
                        name: "**Questions / Вопросы **",
                        value:
                            "```q!add``` ```q!delete``` ```q!edit``` ```q!show```",
                        inline: true,
                    },
                    {
                        name: "**Bot settings / Настройки бота**",
                        value:
                            "```q!settimeout``` ```q!enableRightAnswer``` ```q!setgamestartperms``` ```q!prefix```",
                        inline: true,
                    },
                    {
                        name: "**Help / Справка**",
                        value: "```q!help``` ```q!botinfo``` ```q!command```",
                        inline: true,
                    },
                    {
                        name: "**Game rules / Правила игры**",
                        value: "```q!rewriterules``` ```q!rules``` ```q!addrule```",
                        inline: true,
                    },
                    {
                        name: "**Leaderboard / Лидерборд**",
                        value: "```q!lb``` ```q!clearLB```",
                        inline: true,
                    },
                    {
                        name: "**Game / Игра**",
                        value: "```q!game```",
                        inline: true,
                    },
                    {
                        name: "Game limiter / Ограничитель игр",
                        value: "```q!maxgames``` ```q!cleargames``` ```q!gamescount```",
                        inline: true
                    },
                    {
                        name: "Export questions / Экспорт вопросов",
                        value: "```q!exportastxt```",
                        inline: true
                    }
                ]),
        ],
    });
};

const commandHelp = async (robot, mess, args) => {
    const command = args[1];

    switch (command) {
        case "rewriterules":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!rewriterules",
                        description: `**Syntax / Синтаксис** - "q!rewriterules <rules>"
      **<rules>** - new rules / новые правила
      **Appointment / Назначение** - setting new game rules / установка новых правил игры
      **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }),
                ],
            });
            break;
        case "rules":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!rules",
                        description: `**Syntax / Синтаксис** - "q!rules"
      **Appointment / Назначение** - showing the rules of the game/ показ правил игры
      **Minimal permissions / Минимальные права** - none`,
                    }),
                ],
            });
            break;
        case "help":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!help",
                        description: `**Syntax / Синтаксис** - "q!help"
      **Appointment / Назначение** - help / справка
      **Minimal permissions / Минимальные права** - none`,
                    }),
                ],
            });
            break;
        case "botinfo":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!botinfo",
                        description: `**Syntax / Синтаксис** - "q!botinfo"
      **Appointment / Назначение** - bot information / информация о боте
      **Minimal permissions / Минимальные права** - none`,
                    }),
                ],
            });
            break;
        case "settimeout":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!settimeout",
                        description: `**Syntax / Синтаксис** - "q!settimeout <timeout>"
      **<timeout>** - timeout for answering a question in seconds / таймаут ответа на вопрос в секундах
      **Appointment / Назначение** - setting a new timeout for answering a question / установка нового таймаута ответа на вопрос
      **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }),
                ],
            });
            break;
        case "command":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!command",
                        description: `**Syntax / Синтаксис** - "q!command <command>"
        **<command>** - get help about command / получить справку о команде
        **Appointment / Назначение** - help / справка
        **Minimal permissions / Минимальные права** - none`,
                    }),
                ],
            });
            break;
        case "game":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!game",
                        description: `**Syntax / Синтаксис** - "q!game <flag>"
      <flag> - condition with which the game can start. Optional argument (you can omit it). In order to find out what the conditions are, write "q!command game-flags" / условие с которым может стартовать игра. Необязательный аргумент (можно не писать). Для того, чтобы узнать какие имеются условия напишите "q!command game-flags"
      **Appointment / Назначение** - starting a game / стартует игру
      **Minimal permissions / Минимальные права** - none`,
                    }),
                ],
            });
            break;
        case "game-flags":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "Flags for q!game",
                        description: `__**-y, -yes**__ = agree with the rules (the bot will not ask the corresponding question) / согласен(а) с правилами (бот не будет задавать соответствующего вопроса)
                        
                        __**-ex, -exclude**__ = exclude some questions from the game (id of questions are indicated later) / исключить некоторые вопросы из игры (id вопросов указываются позже)
                        
                        __**-only**__ = make a game only from certain questions (id will be indicated later). Attention, there is a high probability of frequent repetition of questions! / составить игру только из определенных вопросов (id указываются позже). Внимание, высока вероятность частого повтора вопросов!
                        
                        **_Note: Using the -ex(-exclude) flags significantly reduces the likelihood of the specified question(s) being dropped, but does not exclude it (them)!
                        Примечание: использование флагов -ex(-exclude) значительно уменьшает вероятность выпадения указанного вопроса(ов), но не исключает его(их)!_**
                        `,
                    }),
                ],
            });
            break;
        case "lb":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!lb",
                        description: `**Syntax / Синтаксис** - "q!lb"
      **Appointment / Назначение** - show leaderboard / показывает лидерборд
      **Minimal permissions / Минимальные права** - none`,
                    }),
                ],
            });
            break;
        case "clearLB":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!clearLB",
                        description: `**Syntax / Синтаксис** - "q!clearLB"
      **Appointment / Назначение** - permanent cleaning of the leaderboard / безвозвратная очистка лидерборда
      **Minimal permissions / Минимальные права** - ADMINISTRATOR`,
                    }),
                ],
            });
            break;
        case "delete":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!delete",
                        description: `**Syntax / Синтаксис** - "q!delete <id>"
      **<id>** - question id / id вопроса
      **Appointment / Назначение** - deleting question from db / удаление вопроса из базы
      **Minimal permissions / Минимальные права** - MANAGE_ROLES for deleting 1-4 questions at 1 time & ADMINISTRATOR for deleting 5+ questions at 1 time`,
                    }),
                ],
            });
            break;
        case "add":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!add",
                        description: `**Syntax / Синтаксис** - "q!add <question>"
      **<question>** - text part of question / текстовая часть вопроса
      **Appointment / Назначение** - add question to db / добавление вопроса в базу
      **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }),
                ],
            });
            break;
        case "enableRightAnswer":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!enableRightAnswer",
                        description: `**Syntax / Синтаксис** - "q!enableRightAnswer <value>"
        **<value>** - value (1 - show, 0 - do not show, other values are considered invalid) / значение (1 - показывать, 0 - не показывать, остальные значения считаются не валидными)
        **Appointment / Назначение** - setting the option to show the correct answer if no one answered correctly / установка параметра показа правильного ответа, если никто правильно не ответил
        **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }),
                ],
            });
            break;
        case "edit":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!edit",
                        description: `**Syntax / Синтаксис** - "q!edit <id>"
        **<id>** - question id / id вопроса
        **Appointment / Назначение** - editing already added question / изменение уже добавленного вопроса
        **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }),
                ],
            });
            break;
        case "show":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!show",
                        description: `**Syntax / Синтаксис** - "q!show <id>"
**<id>** - question id or "all" to see all questions / id вопроса или "all", чтобы увидеть все вопросы
**Appointment / Назначение** - showing the question in preview mode / показ вопроса в режиме предпросмотра
**Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }),
                ],
            })
            break;
        case "maxgames":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!maxgames",
                        description: `**Syntax / Синтаксис** - "q!maxgames <value>"
          **<value>** - the maximum number of games that 1 person can play per day / максимальное количество игр, которой может запустить 1 человек в день
          **Appointment / Назначение** - setting the parameter of the maximum running games by 1 person per day / установка параметра максимально запущенных игр 1 человеком в день
          **Minimal permissions / Минимальные права** - ADMINISTRATOR`,
                    }),
                ],
            });
            break;
        case "addrule":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!addrule",
                        description: `**Syntax / Синтаксис** - "q!addrule <rule>"
          **<rule>** - new rule to be added / новое правило, которое надо добавить
          **Appointment / Назначение** - updating rules / обновление правил
          **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }),
                ],
            });
            break;
        case "cleargames":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!cleargames",
                        description: `**Syntax / Синтаксис** - "q!cleargames <user>"
          **<user>** - the person whose games information needs to be deleted (ping or "all" to clear the entire list)/ человек, инфу по играм которого надо удалить (пинг или "all" для очистки всего списка)
          **Appointment / Назначение** - clearing games list for game limiter / очистка списка игр для ограничителя игр
          **Minimal permissions / Минимальные права** - ADMINISTRATOR`,
                    }),
                ],
            });
            break;
        case "gamescount":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!gamescount",
                        description: `**Syntax / Синтаксис** - "q!gamescount"
          **Appointment / Назначение** - show started games by user / показ начатых игр игроком
          **Minimal permissions / Минимальные права** - none`,
                    }),
                ],
            });
            break;
        case "setgamestartperms":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!setgamestartperms ",
                        description: `**Syntax / Синтаксис** - "q!setgamestartperms <PERMS>"
          <PERMS> - permissions required to run the game (ADMINISTRATOR, MANAGE_ROLES, MANAGE_CHANNELS, everyone) / права, нужные для запуска игры (ADMINISTATOR, MANAGE_ROLES, MANAGE_CHANNELS, everyone)
          **Appointment / Назначение** - setting a restriction on the launch of games by perms / установка ограничения на запуск игр по правам
          **Minimal permissions / Минимальные права** - ADMINISTRATOR`,
                    }),
                ],
            });
            break;
        case "exportastxt":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!exportastxt",
                        description: `**Syntax / Синтаксис** - "q!exportastxt <questions>"
          <questions> - ids of questions to export ("all" to export all questions) / id вопросов для экспорта ("all" для экспорта всех вопросов)
          **Appointment / Назначение** - export questions from the database to a .txt file / экспорт  вопросов из базы в файл .txt
          **Minimal permissions / Минимальные права** - MANAGE_ROLES`,
                    }),
                ],
            });
            break;
        case "prefix":
            await mess.channel.send({
                embeds: [
                    createEmbed({
                        title: "q!prefix",
                        description: `**Syntax / Синтаксис** - "q!prefix <prefix>"
          **<prefix>** - new server prefix of the bot / новый серверный префикс бота
          **Appointment / Назначение** - change bot prefix / смена префикса бота
          **Minimal permissions / Минимальные права** - ADMINISTRATOR`,
                        footer: "Default prefix / Префикс по умолчанию - q!"
                    }),
                ],
            });
            break;
        default:
            await mess.channel.send({
                content: "Command not found / Команда не найдена",
            });
    }
};

module.exports = {botinfo, help, commandHelp};
