require('dotenv').config({
    path: __dirname + "/.env.local"
})

const Discord = require('discord.js');
const intents = Discord.Intents.FLAGS
const client = new Discord.Client({intents: [intents.GUILDS, intents.GUILD_MESSAGES, intents.GUILD_MESSAGE_REACTIONS, intents.GUILD_MEMBERS]});
const Events = require('./Events')

Events.ready(client)
Events.guildCreate(client)
Events.guildDelete(client)
Events.guildMemberAdd(client)
Events.guildMemberRemove(client)
Events.message(client)

client.login(process.env.TOKEN)
