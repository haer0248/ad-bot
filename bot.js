require('dotenv').config()

const messageHandler = require('./Modules/messageHandler');
const Logger = require('./Modules/logger');
const Discord = require('discord.js');

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.MessageContent
    ],
    partials: [
        Discord.Partials.User,
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
        Discord.Partials.Message,
        Discord.Partials.Reaction
    ]
});
global.client = client;
global.Logger = Logger;

const allowedGuilds = [327047979661787146, 600358280232960009];

client.on('ready', () => {

    client.user.setActivity({
        name: `貓咪休息室 | ねこのラウンジ 😸`,
        type: Discord.ActivityType.Watching
    });

    setInterval(() => {
        client.user.setActivity({
            name: `貓咪休息室 | ねこのラウンジ 😸`,
            type: Discord.ActivityType.Watching
        });
    }, 60000 * 10);

    Logger.run('INFO', `Logged in as ${client.user.tag}!`);
});

client.login(process.env.TOKEN);
client.on('messageCreate', messageHandler.handleMessage);
client.on('messageUpdate', messageHandler.handleMessageUpdate);

client.on('guildCreate', async (guild) => {
    try {
        if (!allowedGuilds.includes(guild.id)) {
            console.log(`未授權的伺服器: ${guild.name} (${guild.id}) - 正在離開`);
            await guild.leave();
            console.log(`已離開 ${guild.name}`);
        } else {
            console.log(`已加入授權伺服器: ${guild.name} (${guild.id})`);
        }
    } catch (error) {
        console.error('處理伺服器加入時發生錯誤:', error);
    }
});

process.on('uncaughtException', (e) => {
    console.error(e)
})