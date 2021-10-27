require('dotenv').config()

const Discord = require('discord.js');
const robot = new Discord.Client({intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]});

const comms = require("./comms.js");
const fs = require('fs');

let token = process.env.token;
let prefix = process.env.prefix;

const serverSchema = require('./schemas/server-schema')
const dateSchema = require('./schemas/date-schema')
const connectToDb = require('./mongoconnect')

robot.on("ready", async function (guild) {
    console.log(robot.user.username + " запустился!")
});

robot.on("guildCreate", async function (guild) {
    await connectToDb().then(async mongoose => {
        try {
            await new serverSchema({
                server: guild.id,
                rules: '',
                questions: [],
                questionTimeout: 30000,
                leaderboard: {},
                showRightAnswer: false,
                games: {max: NaN},
                questionIDs: [],
                whoCanStartGame: "everyone",
                prefix: "q!"
            }).save()
            await serverSchema.updateOne({server: guild.id}, {
                leaderboard: {},
                questionIDs: []
            })
        } finally {
            await mongoose.endSession()
        }
    })
})

robot.on("guildDelete", async function (guild) {
    await connectToDb().then(async mongoose => {
        try {
            await serverSchema.deleteOne({server: guild.id})
        } finally {
            await mongoose.endSession()
        }
    })
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

    if (msg.author.username != robot.user.username && msg.author.discriminator != robot.user.discriminator) {
        var comm = msg.content.trim() + " ";
        var comm_name = comm.slice(0, comm.indexOf(" "));
        var messArr = comm.split(" ");
        for (comm_count in comms.comms) {
            var comm2 = prefix + comms.comms[comm_count].name;
            if (comm2 == comm_name) {
                comms.comms[comm_count].out(robot, msg, messArr);
            }
        }
    }
});

setInterval(async () => {
    await connectToDb().then(async mongoose => {
        try {
            await dateSchema.updateOne({type: "general"}, {date: Date.now()})
            await serverSchema.updateMany({}, {games: {}})
        } finally {
            await mongoose.endSession()
        }
    })
}, 86400000)

setInterval(() => {
    const num = 1+56
    console.log(num**2)
}, 1500000)

robot.login(token);
