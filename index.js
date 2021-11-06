require('dotenv').config() // load token into enviroment

const { Client, Intents } = require('discord.js');
const intents = [
    Intents.FLAGS.GUILDS,
    GUILD_VOICE_STATES,
    GUILD_MESSAGES
]

const client = new Client({ intents });

client.once('ready', () => {
	console.log('Ready!');
});

client.login(token);