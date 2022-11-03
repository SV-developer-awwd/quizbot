const {MessageEmbed} = require("discord.js");
const Embeds = require('../functions/Embeds')
const Interactions = require('../functions/Interactions')
const settingsController = require('../database/controllers/settings.controller')

class Help {
    constructor() {
    }

    async botinfo(msg, client) {
        const developer = await client.users.fetch("749999134919884890")

        await msg.channel.send({
            embeds: [await Embeds.create({
                title: "Information about the bot",
                description: `**Developed by** - <@749999134919884890> (@${developer.username}#${developer.discriminator})
      **Default prefix** - q!
      **Help command** - q!help`
            }, msg.guild.id)]
        })
    }

    async help(msg, client) {
        const settings = await settingsController.getSettings(msg.guild.id)
        const prefix = settings.prefix ?? "q!"

        await msg.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(settings.embedColor ?? "#0000ff")
                    .setTitle("Bot commands")
                    .setDescription(
                        "All commands of the bot are presented here. Some of them may be unavailable due to lack of appropriate rights. For detailed help on a command, write ```q!command rules``` replacing the \"rules\" with the desired command"
                    )
                    .addFields([
                        {
                            name: "**Game rules**",
                            value: `\`\`\`${prefix}rewriterules\`\`\` \`\`\`${prefix}rules\`\`\` \`\`\`${prefix}addrule\`\`\``,
                            inline: true,
                        },
                        {
                            name: "**Help**",
                            value: `\`\`\`${prefix}help\`\`\` \`\`\`${prefix}botinfo\`\`\` \`\`\`${prefix}commandhelp\`\`\``,
                            inline: true,
                        },
                        {
                            name: "**Bot settings**",
                            value:
                                `\`\`\`${prefix}settings\`\`\` \`\`\`${prefix}update\`\`\` \`\`\`${prefix}reset\`\`\``,
                            inline: true,
                        },
                        {
                            name: "**Questions**",
                            value:
                                `\`\`\`${prefix}add\`\`\` \`\`\`${prefix}delete\`\`\` \`\`\`${prefix}edit\`\`\` \`\`\`${prefix}show\`\`\``,
                            inline: true,
                        },
                        {
                            name: "**Leaderboard**",
                            value: `\`\`\`${prefix}lb\`\`\` \`\`\`${prefix}clearLB\`\`\``,
                            inline: true,
                        },
                        {
                            name: "**Quiz**",
                            value: `\`\`\`${prefix}quiz\`\`\``,
                            inline: true,
                        },
                        {
                            name: "**Questions export**",
                            value: `\`\`\`${prefix}export\`\`\``,
                            inline: true
                        }
                    ]),
            ],
        });
    }

    async commandHelp(msg, client) {
        const settings = await settingsController.getSettings(msg.guild.id)
        const prefix = settings.prefix ?? "q!"

        const command = await Interactions.menu(client, msg.guild.id, msg.channel.id, [
            {
                label: "rewriterules",
                description: "Сomplete rewriting of the rules",
                value: "0"
            },
            {
                label: "rules",
                description: "View rules",
                value: "1"
            },
            {
                label: "addrule",
                description: "Adding rules to the end of the current ones",
                value: "2"
            },
            {
                label: "help",
                description: "Help",
                value: "3"
            },
            {
                label: "botinfo",
                description: "Bot details",
                value: "4"
            },
            {
                label: "commandhelp",
                description: "Help for each bot command",
                value: "5"
            },
            {
                label: "settings",
                description: "View settings",
                value: "6"
            },
            {
                label: "update",
                description: "Settings update",
                value: "7"
            },
            {
                label: "reset",
                description: "Reset settings to default",
                value: "8"
            },
            {
                label: "add",
                description: "Adding questions",
                value: "9"
            },
            {
                label: "delete",
                description: "Deleting questions",
                value: "10"
            },
            {
                label: "edit",
                description: "Editing questions",
                value: "11"
            },
            {
                label: "show",
                description: "Viewing questions",
                value: "12"
            },
            {
                label: "lb",
                description: "View leaderboard",
                value: "13"
            },
            {
                label: "clearlb",
                description: "Clearing the leaderboard",
                value: "14"
            },
            {
                label: "quiz",
                description: "Quiz start command",
                value: "15"
            },
            {
                label: "export",
                description: "Exporting questions",
                value: "16"
            }
        ], {
            embeds: [await Embeds.create({
                title: "Please choose the command for help"
            }, msg.guild.id)]
        })

        switch (command) {
            case 0:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}rewriterules`,
                            description: `**Syntax** - "${prefix}rewrite <rules>"
      **<rules>** - new rules
      **Appointment** - setting new game rules
      **Required permissions** - MANAGE_ROLES`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 1:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}rules`,
                            description: `**Syntax** - "${prefix}rules"
      **Appointment** - showing the rules of the game
      **Required permissions** - none`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 2:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}addrule`,
                            description: `**Syntax** - "${prefix}addrule"
          **Appointment** - updating rules
          **Required permissions** - MANAGE_ROLES`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 3:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}help`,
                            description: `**Syntax** - "${prefix}help"
      **Appointment** - help
      **Required permissions** - none`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 4:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}botinfo`,
                            description: `**Syntax** - "${prefix}botinfo"
      **Appointment** - bot information
      **Required permissions** - none`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 5:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}commandhelp`,
                            description: `**Syntax** - "${prefix}commandhelp"
        **Appointment** - help
        **Required permissions** - none`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 6:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}settings`,
                            description: `**Syntax** - "${prefix}settings"
          **Appointment** - show current bot settings
          **Required permissions** - MANAGE_ROLES`
                        }, msg.guild.id)
                    ]
                })
                break
            case 7:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}update`,
                            description: `**Syntax** - "${prefix}update"
          **Appointment** - updates bot settings
          **Required permissions** - MANAGE_ROLES`
                        }, msg.guild.id)
                    ]
                })
                break
            case 8:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}reset`,
                            description: `**Syntax** - "${prefix}reset"
          **Appointment** - resets bot settings to standard (it will also delete all questions and rules, clear the leaderboard)
          **Required permissions** - ADMINISTRATOR`
                        })
                    ]
                })
                break
            case 9:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}add`,
                            description: `**Syntax** - "${prefix}add"
      **Appointment** - add question to db
      **Required permissions** - MANAGE_ROLES`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 10:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}delete`,
                            description: `**Syntax** - "${prefix}delete"
      **Appointment** - deleting question from db
      **Required permissions** - MANAGE_ROLES for deleting 1-4 questions at 1 time & ADMINISTRATOR for deleting 5+ questions at 1 time`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 11:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}edit`,
                            description: `**Syntax** - "${prefix}edit"
        **Appointment** - editing already added question
        **Required permissions** - MANAGE_ROLES`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 12:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}show`,
                            description: `**Syntax** - "${prefix}show"
**Appointment** - showing the question in preview mode
**Required permissions** - MANAGE_ROLES`,
                        }, msg.guild.id),
                    ],
                })
                break;
            case 13:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}lb`,
                            description: `**Syntax** - "${prefix}lb"
      **Appointment** - show leaderboard
      **Required permissions** - none`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 14:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}clearLB`,
                            description: `**Syntax** - "${prefix}clearLB"
      **Appointment** - permanent cleaning of the leaderboard
      **Required permissions** - ADMINISTRATOR`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 15:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}quiz`,
                            description: `**Syntax** - "${prefix}quiz"
      **Appointment** - starting a quiz
      **Required permissions** - none`,
                        }, msg.guild.id),
                    ],
                });
                break;
            case 16:
                await msg.channel.send({
                    embeds: [
                        await Embeds.create({
                            title: `${prefix}export`,
                            description: `**Syntax** - "${prefix}export"
          **Appointment** - export questions from the database to a .txt file
          **Required permissions** - MANAGE_ROLES`,
                        }, msg.guild.id),
                    ],
                });
                break;
            default:
                await Embeds.errors.invalidValue(client, msg.guild.id, msg.channel.id)
        }
    }
}

module.exports = new Help()