/*

Join -> voiceConnection
voiceConnection.subscribe(AudioPlayer)
audioPlayer plays AudioResource

per stream we want audioresource
create one per stream


*/
const { queue, audioPlayers, playNext, reactions } = require("../general.js");

const { songAdded } = require("../presetEmbeds.js");

const { AudioPlayerStatus } = require("@discordjs/voice");

const playdl = require("play-dl");

const join = require("./join.js");
const unpause = require("./unpause.js");

// eslint-disable-next-line
// const ytRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;

function AddSCdataToQueue(message, data) {
	let artist = false;
	if (data.publisher && data.publisher.artist) {
		artist = data.publisher.artist;
	}
	const queueData = {
		"title":		data.name,
		"url": 			data.url,
		"author": 		artist || data.user.name,
		"durationInSec":data.durationInSec,
		"thumbURL": 	data.thumbnail,
		"type": 		"so_track",
		"requester":	message.author,
		"channel": 		message.channel,
	};
	queue[message.guild.id].push(queueData);
	message.react(reactions.positive);
	// send embed and delete after 60 seconds
	message.reply({ embeds:[songAdded(queueData)] })
		.then(msg => {
			setTimeout(() => msg.delete(), 60000);
		});
}

function addYTdataToQueue(message, data) {
	const queueData = {
		"title":		data.title,
		"url": 			data.url,
		"author": 		data.channel.name,
		"durationInSec":data.durationInSec,
		"thumbURL": 	data.thumbnail.url,
		"type": 		"yt_track",
		"requester":	message.author,
		"channel": 		message.channel,
	};
	queue[message.guild.id].push(queueData);
	message.react(reactions.positive);
	// send embed and delete after 60 seconds
	message.reply({ embeds:[songAdded(queueData)] })
		.then(msg => {
			setTimeout(() => msg.delete(), 60000);
		});
}

async function play(message, args, command) {
	// If already in a voice channel or able to join
	if (!message.guild.me.voice.channelId) {
		// const voiceConnection =
		// const { audioPlayer } =
		await join(message);
		// const voiceConnection = getVoiceConnection(message.channel.guild.id);


	}

	if (!message.member.voice || !message.member.voice.channelId) {
		message.react(reactions.negative);
		return false;
	}

	// check for args
	console.log(args);
	if (args) {
		const validate = await playdl.validate(args);
		console.log(validate);
		if (validate == "search") {
			if (command == "music") {
				// search soundcloud
				const data = await playdl.search(args, { "limit":4, "source":{ "soundcloud":"tracks" } });
				for (let i = 0; i < data.length; i++) {
					// loop through so we can get rid of pro results
					if (Number(data[i].durationInSec) > 30) {
						// add first result to queue
						AddSCdataToQueue(message, data[i]);
						break;
					}
				}

			}
			else {
				// search youtube
				const data = await playdl.search(args, { "limit":1, "source":{ "youtube":"video" } });
				// add first result to queue
				addYTdataToQueue(message, data[0]);
			}
		}
		else if (validate == "so_track") {
			// get soundcloud track info
			const data = await playdl.soundcloud(args);
			// add result to queue
			AddSCdataToQueue(message, data);
		}
		else if (validate == "sp_track") {
			// get spotify song data so we can search on soundcloud
			const spotifyData = await playdl.spotify(args);
			if (spotifyData.type == "track") {
				// search soundcloud
				const data = await playdl.search(args, { "limit":4, "source":{ "soundcloud":"tracks" } });
				for (let i = 0; i < data.length; i++) {
					// loop through so we can get rid of pro results
					if (Number(data[i].durationInSec) > 30) {
						// add first result to queue
						AddSCdataToQueue(message, data[i]);
						break;
					}
				}

			}
		}
		else if (validate == "dz_track") {
			// get deezer song data so we can search on soundcloud
			const deezerData = await playdl.deezer(args);
			if (deezerData.type == "track") {
				// search soundcloud
				const data = await playdl.search(args, { "limit":1, "source":{ "soundcloud":"tracks" } });
				// add first result to queue
				AddSCdataToQueue(message, data[0]);
			}
		}
		else if (validate == "yt_video") {
			// get youtube video info
			const data = await playdl.video_basic_info(args);
			// add result to queue
			addYTdataToQueue(message, data.video_details);
		}
		else {
			message.react(reactions.confused);
		}
	}

	// if paused unpause
	if (audioPlayers[message.guildId].state.status == AudioPlayerStatus.Paused) {
		unpause(message);
	}


	console.log(audioPlayers[message.guildId].state.status == AudioPlayerStatus.Idle);
	if (audioPlayers[message.guildId].state.status == AudioPlayerStatus.Idle && queue[message.guild.id][0]) {
		playNext(message);
	}

}

module.exports = play;