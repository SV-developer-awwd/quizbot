const Exports = require('./commands/Exports')
const Help = require('./commands/Help')
const Leaderboard = require('./commands/Leaderboard')
const Questions = require('./commands/Questions')
const Quiz = require('./commands/Quiz')
const Rules = require('./commands/Rules')
const Settings = require('./commands/Settings')

const commands = {
    // rules //
    addrule: Rules.add,
    rules: Rules.show,
    rewriterules: Rules.rewrite,
    // end rules //

    // settings//
    settings: Settings.show,
    update: Settings.update,
    reset: Settings.reset,
    // end settings //

    // leaderboard //
    lb: Leaderboard.show,
    clearlb: Leaderboard.clear,
    // end leaderboard //

    // export questions //
    export: Exports.chooseFormat,
    // end export questions //

    // manage questions //
    add: Questions.add,
    delete: Questions.delete,
    edit: Questions.edit,
    show: Questions.show,
    // end manage questions //

    // playing quizzes //
    quiz: Quiz.start,
    // end playing quizzes //

    // help //
    botinfo: Help.botinfo,
    help: Help.help,
    commandhelp: Help.commandHelp,
    // end help //
}

module.exports = commands;
