// require('dotenv').config()
require('dotenv').config({
    path: __dirname + "/.env.local"
})

const Discord = require('discord.js');
const intents = Discord.Intents.FLAGS
const robot = new Discord.Client({intents: [intents.GUILDS, intents.GUILD_MESSAGES, intents.GUILD_MESSAGE_REACTIONS]});

const comms = require("./comms.js");
const {slash_comms_list, replySlash} = require("./slash-comms");

let token = process.env.token;
let prefix = process.env.prefix;
const {defaultSettings} = require("./defaultSettings");

const serverSchema = require('./schemas/server-schema')
const connectToDb = require('./mongoconnect')

robot.on("ready", async function () {
    console.log(robot.user.username + " successfully started!")

    let commands = robot.application.commands
    for (let i = 0; i < slash_comms_list.length; i++) {
        await commands.create(slash_comms_list[i])
    }
});

robot.on("guildCreate", async function (guild) {
    let res = {}
    await connectToDb().then(async (mongoose) => {
        try {
            res = await serverSchema.findOne({server: guild.id})
        } finally {
            await mongoose.endSession()
        }
    })

    if (!res) {
        await connectToDb().then(async mongoose => {
            try {
                await new serverSchema({
                    server: guild.id
                }).save()
                await serverSchema.updateOne({server: guild.id}, defaultSettings)
            } finally {
                await mongoose.endSession()
            }
        })
    }
})

robot.on('message', async (msg) => {
    await connectToDb().then(async mongoose => {
        try {
            const res = await serverSchema.findOne({server: msg.guild.id})
            prefix = res.prefix;
        } finally {
            await mongoose.endSession()
        }
    })

    if (msg.author.username !== robot.user.username && msg.author.discriminator !== robot.user.discriminator) {
        let comm = msg.content.trim() + " ";
        let comm_name = comm.slice(0, comm.indexOf(" "));
        let messArr = comm.split(" ");
        for (comm_count in comms.comms) {
            let comm2 = prefix + comms.comms[comm_count].name;
            if (comm2 === comm_name) {
                await comms.comms[comm_count].out(robot, msg, messArr);
            }
        }
    }
});

robot.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return

    await replySlash(robot, interaction)
})

setInterval(async () => {
    await connectToDb().then(async mongoose => {
        try {
            await serverSchema.updateMany({}, {games: {}})
        } finally {
            await mongoose.endSession()
        }
    })
}, 86400000)


robot.login(token)

//------------------------- EXPRESS SERVER FOR HEROKU -----------------------------------//
const express = require('express')
const PORT = process.env.PORT
const app = express()

let getMethod = undefined

try {
    getMethod = app.get("/", (req, res) => {
        res.status(200).send("Discord bot - Quiz bot")
    })
} catch (e) {
} finally {
    console.log("REQ")
}

app.listen(PORT, () => {
    console.log(`Express has started successfully at ${PORT}`)
})

setInterval(() => {
    console.log(Math.random() + Math.random())
}, 1500000) //1500000
