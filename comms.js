// RULES //
const {showRules, addRules, rewriteRules} = require("./commands/rules");

// QUESTIONS //
const {
    addQuestion,
    deleteQuestion,
    editQuestion,
    showQuestion
} = require('./commands/questions')

// GAME //
const {game} = require('./commands/quizzes/game');

// SETTINGS //
const {
    showSettings,
    resetSettings, updateSettings
} = require("./commands/settings");

// HELP //
const {botinfo, help, commandHelp} = require("./commands/help");

// LEADERBOARD //
const {showLB, clearLB} = require("./commands/leaderboard");

// GAME LIMITER //
const {changeMaxGamesForUser, clearGamesList, showGames} = require("./commands/gameLimiter");

// EXPORT QUESTIONS //
const {exportAsTXT} = require('./commands/exports')

let comms_list = [
    {
        name: "rewrite",
        out: rewriteRules,
        about: "",
    },
    {
        name: "rules",
        out: showRules,
        about: "",
    },
    {
        name: "add",
        out: addQuestion,
        about: ""
    },
    {
        name: "delete",
        out: deleteQuestion,
        about: ""
    },
    {
        name: "game",
        out: game,
        about: ""
    },
    {
        name: "botinfo",
        out: botinfo,
        about: ""
    },
    {
        name: "help",
        out: help,
        about: ""
    },
    {
        name: "lb",
        out: showLB,
        about: ""
    },
    {
        name: "clearLB",
        out: clearLB,
        about: ""
    },
    {
        name: "command",
        out: commandHelp,
        about: ""
    },
    {
        name: "edit",
        out: editQuestion,
        about: ""
    },
    {
        name: "show",
        out: showQuestion,
        about: ""
    },
    {
        name: "maxgames",
        out: changeMaxGamesForUser,
        about: ""
    },
    {
        name: "addrule",
        out: addRules,
        about: ""
    },
    {
        name: 'cleargames',
        out: clearGamesList,
        about: ""
    },
    {
        name: "gamescount",
        out: showGames,
        about: ""
    },
    {
        name: "export",
        out: exportAsTXT,
        about: ""
    },
    {
        name: "settings",
        out: showSettings,
        about: ""
    },
    {
        name: "reset",
        out: resetSettings,
        about: ""
    },
    {
        name: "update",
        out: updateSettings,
        about: ""
    }
];

module.exports.comms = comms_list;
