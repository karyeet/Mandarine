/*

Join -> voiceConnection
voiceConnection.subscribe(AudioPlayer)
audioPlayer plays AudioResource

per stream we want audioresource
create one per stream


*/
const { queue, audioPlayers, playNext, searchSC } = require("../general.js");

const { AudioPlayerStatus } = require("@discordjs/voice");

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
		const validate = await playdl.validate(args);
		console.log(validate);
		if (validate == "search") {
			const data = await playdl.search(args, { "limit":1, "source":{ "youtube":"video" } });
			queue[message.guild.id].push(data[0].url);
		}
		else if (validate == "sp_track") {
			// get spotify song data so we can search on soundcloud
			const spotifyData = await playdl.spotify(args);
			if (spotifyData.type == "track") {
				// search soundcloud
				const data = await searchSC(spotifyData.name);
				// add first result to queue
				queue[message.guild.id].push(data.collection[0].permalink_url);
			}
		}
		else if (validate == "dz_track") {
			// get deezer song data so we can search on soundcloud
			const deezerData = await playdl.deezer(args);
			if (deezerData.type == "track") {
				// search soundcloud
				const data = await searchSC(deezerData.name);
				// add first result to queue
				queue[message.guild.id].push(data.collection[0].permalink_url);
			}
		}
		else if (validate) {
			queue[message.guild.id].push(args);
		}
	}

	// if paused unpause
	if (audioPlayers[message.guildId].state.status == AudioPlayerStatus.Paused) {
		unpause(message);
	}


	if (audioPlayers[message.guildId].state.status == AudioPlayerStatus.Idle && queue[message.guild.id][0]) {
		playNext(message);
	}

}

module.exports = play;