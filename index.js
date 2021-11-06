// load token into enviroment
require('dotenv').config();

const { Client, Intents } = require('discord.js');

// Intents: Guilds, VoiceStates, GuildMesssages
const intents = [Intents.FLAGS.GUILDS, Intents.GUILD_VOICE_STATES, Intents.GUILD_MESSAGES];

// Create Client
const client = new Client({ intents });

client.once('ready', () => {
	console.log('Ready!');
});

// Login
client.login(process.env.token);

