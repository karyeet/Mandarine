/*

Check if user is in voiceChannel
Check if bot is in voiceChannel

If user and bot are in same voice channel

Remove song from queue
---create AudioResource for next song in queue
---Tell AudioPlayer to start playing AudioResource
If queue is empty do not call play

*/

const { queue, audioPlayers } = require("../general.js");

const play = require("./play.js");

/*
Function checks if bot is in the voice channel AND if user who called upon skip is in the same channel.
It then shifts the audioPlayer to next in queue. Next it stops what is in current queue and then calls upon play function in play.js
*/
function skip(message) {
	if (!(message.guild.me.voice.channelId) && !(message.member.voice.channelId == message.guild.me.voice.channelId)) {
		return false;
	}

	const audioPlayer = audioPlayers[message.guild.id];

	queue[message.guild.id].shift();
	audioPlayer.stop();

	play(message);

}

module.exports = skip;
