// https://v13.discordjs.guide/interactions/slash-commands.html#registering-slash-commands


const { token } = require('./config.json');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(token);

const SLASH_COMMANDS = {
    join: new SlashCommandBuilder()
    	.setName('join')
   		.setDescription('Join your voice channel!'),

	disconnect: new SlashCommandBuilder()
    	.setName('disconnect')
    	.setDescription('Leave your voice channel!'),

	pause: new SlashCommandBuilder()
    	.setName('pause')
    	.setDescription('Pause the current track'),

	queue: new SlashCommandBuilder()
    	.setName('queue')
    	.setDescription('Show the queue.'),

	remove: new SlashCommandBuilder()
    	.setName('remove')
    	.setDescription('Remove a track from the queue.')
		.addIntegerOption(option =>
		 	option.setName('index')
				.setDescription('Index of the track, can be found using /queue')
                .setRequired(true)
		 ),

	loop: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Toggle track looping.'),
	
/*	spotify: new SlashCommandBuilder()
		.setName('spotify')
		.setDescription('Control the bot with spotify! User must be sharing their currently listening to with discord.')
		.addUserOption(option =>
			 option.setName('user')
			 	.setDescription('User to listen along to.')
                .setRequired(true)
				),
*/

	skip: new SlashCommandBuilder()
    	.setName('skip')
    	.setDescription('Skip the current track'),

	resume: new SlashCommandBuilder()
    	.setName('resume')
    	.setDescription('Resume the current track'),

	play: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play audio from youtube or soundcloud')
		.addStringOption(option =>
			option.setName('audio')
				.setDescription('Audio name or link from youtube or soundcloud.')
				.setRequired(true)
		),
	music: new SlashCommandBuilder()
		.setName('music')
		.setDescription('Play music from a large library of mp3 files.')
		.addStringOption(option =>
			option.setName('song')
				.setDescription('Song name.')
				.setRequired(true)
		),	
    

}


async function registerSlashCommands(clientId, commands){
    const commandsJSON = [];
    for (const command of Object.keys(commands)) {
        commandsJSON.push(commands[command].toJSON());
    }
    console.log(JSON.stringify(commandsJSON))

	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commandsJSON },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.warn(error);
	}
    
};


registerSlashCommands("906647083572920381", SLASH_COMMANDS)

module.exports = registerSlashCommands;