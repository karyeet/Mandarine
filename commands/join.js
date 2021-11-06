/*

Check if already in a discord voicechannel in members guild
voicechannel = voicestate

Check if member is in a voice channel

If so then join members current voice channel

*/

// const { client } = require("./index.js");

function run(message) {
	const voice = message.member.voice;

	if (!voice.channelID) {
		message.reply("You are not in a voice chanel");
		return false;
	}

	return voice.channel.join();

}

exports = run;