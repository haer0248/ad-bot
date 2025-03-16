const fs = require('fs');
const path = require('path');

module.exports = {
    async run(type, message) {
        try {
            logToFile(type, message);
            
            if (!process.env.LOG_GUILD_ID) return;
            const fetchGuild = await client.guilds.fetch(process.env.LOG_GUILD_ID)
            if (!process.env.LOG_CHANNEL_ID) return;
            const fetchChannel = await fetchGuild.channels.cache.get(process.env.LOG_CHANNEL_ID);

            let format_message = `${formatDiscordTimestamp()} **\` ${type} \`** ${message}`;
            format_message = format_message.replaceAll('_', '\\_');
            if (fetchChannel) {
                fetchChannel.send({ content: format_message })
            }
            console.log(format_message);
        } catch (error) {
            console.log(error.stack);
        }
    }
}

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}`;
}

function logToFile(type, message) {
    const logDate = getCurrentDate();
    const logFileName = `${logDate}.log`;
    const logsFolderPath = path.join(__dirname, '..', 'Logs');
    const logFilePath = path.join(logsFolderPath, logFileName);

    if (!fs.existsSync(logsFolderPath)) {
        fs.mkdirSync(logsFolderPath);
    }

    const formattedDate = new Date().toJSON();
    const formattedMessage = `[${formattedDate}] [${type}] ${message}\n`;

    fs.appendFile(logFilePath, formattedMessage, (err) => {
        if (err) {
            console.error(`Error writing to log file: ${err.message}`);
        }
    });
}

function formatDiscordTimestamp() {
    var nowTime = Math.floor(new Date().getTime() / 1000);
    return `<t:${nowTime}:t>`
}