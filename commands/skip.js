/*

Check if user is in voiceChannel
Check if bot is in voiceChannel

If user and bot are in same voice channel

Remove song from queue
---create AudioResource for next song in queue
---Tell AudioPlayer to start playing AudioResource
If queue is empty do not call play

*/

const { audioPlayers, reactions } = require("../general.js");

// const play = require("./play.js");

/*
Function checks if bot is in the voice channel AND if user who called upon skip is in the same channel.
It stops what is in current queue, the listener in join.js skips, and then calls upon play function in play.js
*/
function skip(message) {
	if (!(message.guild.me.voice.channelId) && !(message.member.voice.channelId == message.guild.me.voice.channelId)) {
		message.react(reactions.negative);
		return false;
	}

	const audioPlayer = audioPlayers[message.guild.id];
	// the listener in join.js will automatically shift when the audio is stopped
	message.react(reactions.positive);
	audioPlayer.stop();
	// We dont need to call play because the listener will call it when the audio is stopped
	// play(message);

}

module.exports = skip;
