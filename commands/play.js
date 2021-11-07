/*

Join -> voiceConnection
voiceConnection.subscribe(AudioPlayer)
audioPlayer plays AudioResource

per stream we want audioresource
create one per stream


*/
const { queue, audioPlayers } = require("../general.js");

const { createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");

const playdl = require("play-dl");

const join = require("./join.js");
const unpause = require("./unpause.js");

// eslint-disable-next-line
const ytRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;

async function play(message, args) {
	// If already in a voice channel or able to join
	if (!message.guild.me.voice.channelId) {
		// const voiceConnection =
		// const { audioPlayer } =
		join(message);
		// const voiceConnection = getVoiceConnection(message.channel.guild.id);


	}
	// check for args
	if (args) {
		const ytRegexMatch = args.match(ytRegex);
		// check for youtube link
		if (ytRegexMatch) {
			console.log(ytRegexMatch[1]);
			queue[message.guild.id].push(ytRegexMatch[1]);
		}
		else {

			// search youtube
		}
	}

	// if paused unpause
	if (audioPlayers[message.guildId].state.status == AudioPlayerStatus.Paused) {
		unpause(message);
	}


	if (audioPlayers[message.guildId].state.status == AudioPlayerStatus.Idle && queue[message.guild.id][0]) {
		const ytStream = await playdl.stream("https://www.youtube.com/watch?v=" + queue[message.guild.id][0]);
		const audioResource = createAudioResource(ytStream.stream, ytStream.type);
		audioPlayers[message.guildId].play(audioResource);
	}

}

module.exports = play;