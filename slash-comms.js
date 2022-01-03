const Discord = require("discord.js");
const types = Discord.Constants.ApplicationCommandOptionTypes

// commands
const {slash_rewriteRules, slash_showRules, slash_addRules} = require("./commands/slash-modified/rules");
const {slash_exportAsTXT} = require("./commands/slash-modified/exports");
const {slash_botinfo, slash_help, slash_commandHelp} = require("./commands/slash-modified/help");
const {slash_changeMaxGamesForUser, slash_clearGamesList, slash_showGames} = require("./commands/slash-modified/gameLimiter");
const {slash_showLB, slash_clearLB} = require("./commands/slash-modified/leaderboard");
const {slash_setShowRightAns, slash_setPrefix, slash_setQuestionTimeout, slash_setGameStartPerms, slash_showSettings,
    slash_setEmbedColor
} = require("./commands/slash-modified/settings");
const {slash_showQuestion} = require("./commands/slash-modified/questions");

let slash_comms_list = [
    {
        name: "rewrite",
        description: "Setting new game rules",
        options: [
            {
                name: "rules",
                description: "New game rules",
                required: true,
                type: types.STRING
            }
        ]
    },
    {
        name: "rules",
        description: "Showing the rules of the game",
    },
    // {
    //     name: "add",
    //     description: "Add question to db",
    //     options: [
    //         {
    //             name: "count",
    //             description: "The number of questions to add at a time (without calling the command again)",
    //             required: false,
    //             type: types.NUMBER
    //         }
    //     ]
    // },
    // {
    //     name: "delete",
    //     description: "Deleting question from db",
    //     options: [{
    //         name: "id",
    //         description: "Question id",
    //         required: true,
    //         type: types.NUMBER
    //     }]
    // },
    // {
    //     name: "game",
    //     description: "Starting a game",
    //     options: [{
    //         name: "flag",
    //         description: "Condition with which the game can start",
    //         required: false,
    //         type: types.STRING
    //     }]
    // },
    {
        name: "settimeout",
        description: "Setting a new timeout for answering a question",
        options: [{
            name: "timeout",
            description: "Timeout for answering a question in seconds",
            required: true,
            type: types.NUMBER
        }]
    },
    {
        name: "botinfo",
        description: "Bot information"
    },
    {
        name: "help",
        description: "Help"
    },
    {
        name: "lb",
        description: "Show leaderboard"
    },
    {
        name: "clearlb",
        description: "Permanent cleaning of the leaderboard",
        options: [{
            name: "user",
            description: "The user whose data on the leaderboard is deleted (all for all users)",
            required: true,
            type: types.USER
        }]
    },
    {
        name: "command",
        description: "Help",
        options: [{
            name: "command",
            description: "Get help about command...",
            required: true,
            type: types.STRING
        }]
    },
    {
        name: "enablerightanswer",
        description: "Setting the option to show the correct answer if no one answered correctly",
        options: [{
            name: "value",
            description: "True - enable, false - disable",
            required: true,
            type: types.BOOLEAN
        }]
    },
    // {
    //     name: "edit",
    //     description: "Editing already added question",
    //     options: [{
    //         name: "id",
    //         description: "Question id",
    //         required: true,
    //         type: types.NUMBER
    //     }]
    // },
    {
        name: "show",
        description: "Showing the question in preview mode",
        options: [{
            name: "id",
            description: "Question id or \"all\" to see all questions",
            required: true,
            type: types.STRING
        }]
    },
    {
        name: "maxgames",
        description: "Setting the parameter of the maximum running games by 1 person per day",
        options: [{
            name: "max",
            description: "The maximum number of games that 1 person can play per day",
            required: true,
            type: types.NUMBER
        }]
    },
    {
        name: "addrule",
        description: "Updating rules",
        options: [{
            name: "rule",
            description: "New rule to be added",
            required: true,
            type: types.STRING
        }]
    },
    {
        name: 'cleargames',
        description: "Clearing games list for game limiter",
        options: [{
            name: "user",
            description: "The person whose games information needs to be deleted (ping or \"all\" to clear the entire list)",
            required: true,
            type: types.USER
        }]
    },
    {
        name: "gamescount",
        description: "Show started games by user"
    },
    {
        name: "setgamestartperms",
        description: "Setting a restriction on the launch of games by perms",
        options: [{
            name: "perms",
            description: "Permissions required to run the game (ADMINISTRATOR, MANAGE_ROLES, MANAGE_CHANNELS, everyone)",
            required: true,
            type: types.STRING
        }]
    },
    {
        name: "exportastxt",
        description: "Export questions from the database to a .txt file",
        options: [{
            name: "ids",
            description: "Question ids or \"all\" to export all questions",
            required: true,
            type: types.STRING
        }]
    },
    {
        name: "prefix",
        description: "New server prefix of the bot",
        options: [{
            name: "prefix",
            description: "New prefix",
            required: true,
            type: types.STRING
        }]
    },
    {
        name: "settings",
        description: "Show bot settings"
    },
    {
        name: "color",
        description: "Changes message stroke color",
        options: [{
            name: "color",
            description: "New color (hex)",
            required: true,
            type: types.STRING
        }]
    },
];

const replySlash = async (robot, interaction) => {
    const {commandName, options} = interaction

    switch (commandName) {
        case "rewrite":
            await slash_rewriteRules(robot, interaction, options)
            break
        case "rules":
            await slash_showRules(robot, interaction)
            break
        case "addrule":
            await slash_addRules(robot, interaction, options)
            break
        case "exportastxt":
            await slash_exportAsTXT(robot, interaction, options)
            break
        case "botinfo":
            await slash_botinfo(robot, interaction)
            break
        case "help":
            await slash_help(robot, interaction)
            break
        case "command":
            await slash_commandHelp(robot, interaction, options)
            break
        case "maxgames":
            await slash_changeMaxGamesForUser(robot, interaction, options)
            break
        case "cleargames":
            await slash_clearGamesList(robot, interaction, options)
            break
        case "gamescount":
            await slash_showGames(robot, interaction)
            break
        case "lb":
            await slash_showLB(robot, interaction)
            break
        case "clearlb":
            await slash_clearLB(robot, interaction, options)
            break
        case "enablerightanswer":
            await slash_setShowRightAns(robot, interaction, options)
            break
        case "prefix":
            await slash_setPrefix(robot, interaction, options)
            break
        case "settimeout":
            await slash_setQuestionTimeout(robot, interaction, options)
            break
        case "setgamestartprems":
            await slash_setGameStartPerms(robot, interaction, options)
            break
        case "show":
            await slash_showQuestion(robot, interaction, options)
            break
        case "settings":
            await slash_showSettings(robot, interaction)
            break
        case "color":
            await slash_setEmbedColor(robot, interaction, options)
            break
        default:
    }
}

module.exports = {slash_comms_list, replySlash}
