// load token into enviroment
require('dotenv').config();

const { Client, Intents } = require('discord.js');
const intents = [Intents.FLAGS.GUILDS, Intents.GUILD_VOICE_STATES, Intents.GUILD_MESSAGES];

const client = new Client({ intents });

client.once('ready', () => {
	console.log('Ready!');
});

client.login(process.env.token);

