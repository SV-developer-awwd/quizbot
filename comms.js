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
const {game} = require('./commands/game');

// SETTINGS //
const {setQuestionTimeout, setShowRightAns, setGameStartPerms, setPrefix} = require("./commands/settings");

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
        name: "rewriterules",
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
        name: "settimeout",
        out: setQuestionTimeout,
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
        name: "enableRightAnswer",
        out: setShowRightAns,
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
        name: "setgamestartperms",
        out: setGameStartPerms,
        about: ""
    },
    {
        name: "exportastxt",
        out: exportAsTXT,
        about: ""
    },
    {
        name: "prefix",
        out: setPrefix,
        about: ""
    }
];

module.exports.comms = comms_list;
