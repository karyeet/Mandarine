/*

Check if user is in voiceChannel
Check if bot is in voiceChannel

If user and bot are in same voice channel, disconnect

*/
const { getVoiceConnection } = require("@discordjs/voice");

const { queue, audioPlayers } = require("../general.js");

function disconnect(message) {

	console.log(message.guild.me.voice.channelId);
	console.log(message.member.voice.channelId == message.guild.me.voice.channelId);
	if (!message.guild.me.voice.channelId || !(message.member.voice.channelId == message.guild.me.voice.channelId)) {
		message.reply("We are not in the same voice channel");
		return false;
	}

	queue[message.guildId] == [];
	audioPlayers[message.guildId] == null;
	return getVoiceConnection(message.guildId).destroy();

}

module.exports = disconnect;