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
const deezer = require("../deezer/meezer.js");

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
		"url": 			data.permalink,
		"author": 		artist || data.user.name,
		"durationInSec":data.durationInSec,
		"thumbURL": 	data.thumbnail,
		"type": 		"so_track",
		"requester":	message.author,
		"channel": 		message.channel,
		"stream_url": 	data.permalink,
	};
	queue[message.guild.id].push(queueData);
	message.react(reactions.positive);
	// send embed and delete after 60 seconds
	message.reply({ embeds:[songAdded(queueData, queue[message.guild.id].length - 1)] })
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
		"thumbURL": 	data.thumbnails[data.thumbnails.length - 1].url,
		"type": 		"yt_track",
		"requester":	message.author,
		"channel": 		message.channel,
		"stream_url": 	data.url,
	};
	queue[message.guild.id].push(queueData);
	message.react(reactions.positive);
	// send embed and delete after 60 seconds
	message.reply({ embeds:[songAdded(queueData, queue[message.guild.id].length - 1)] })
		.then(msg => {
			setTimeout(() => msg.delete(), 60000);
		});
}

function addDZdataToQueue(message, data) {
	const queueData = {
		"title":		data.title,
		"url": 			null,
		"author": 		data.artist.name,
		"durationInSec":data.duration,
		"thumbURL": 	data.album.cover_medium,
		"type": 		"dz_track",
		"requester":	message.author,
		"channel": 		message.channel,
		"stream_url": 	data.fileLocation,
	};
	queue[message.guild.id].push(queueData);
	message.react(reactions.positive);
	// send embed and delete after 60 seconds
	message.reply({ embeds:[songAdded(queueData, queue[message.guild.id].length - 1)] })
		.then(msg => {
			setTimeout(() => msg.delete(), 60000);
		});
}

async function play(message, args, command) {
	try {
	// If not already in a voice channel or queue does not exist, (re)join
		if (!message.guild.me.voice.channelId || !queue[message.guild.id]) {
		// const voiceConnection =
		// const { audioPlayer } =
			await join(message);
			// const voiceConnection = getVoiceConnection(message.channel.guild.id);

		}
		else if (!(message.member.voice.channelId == message.guild.me.voice.channelId)) {
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
					const data = await deezer.searchTrack(args);
					// if no result then return false
					if (data && data.link) {
						data.fileLocation = await deezer.DownloadTrack(data.link);
						addDZdataToQueue(message, data);
					}
					else {
						message.react(reactions.warning);
						return false;
					}
				}
				else {
				// search youtube
					const data = await playdl.search(args, { "limit":1, "source":{ "youtube":"video" } });
					// if result, add first result to queue
					if (data && data[0]) {
						addYTdataToQueue(message, data[0]);
					}
					else {
						message.react(reactions.warning);
						return false;
					}
				}
			}
			else if (validate == "so_track") {
			// get soundcloud track info
				const data = await playdl.soundcloud(args);
				// if result, add result to queue
				if (data) {
					AddSCdataToQueue(message, data);
				}
				else {
					message.react(reactions.warning);
					return false;
				}
			}
			else if (validate == "sp_track") {
			// get spotify song data so we can search on soundcloud
				const spotifyData = await playdl.spotify(args);
				if (spotifyData && spotifyData.type == "track") {
					// search youtube
					const data = await playdl.search(`${spotifyData.artists[0].name} - ${spotifyData.name} topic`, { "limit":1, "source":{ "youtube":"video" } });
					// if result, add first result to queue
					if (data && data[0]) {
						addYTdataToQueue(message, data[0]);
					}
					else {
						message.react(reactions.warning);
						return false;
					}
				}
				else {
					message.react(reactions.confused);
					return false;
				}
			}
			else if (validate == "dz_track") {
			// get deezer song data so we can search on soundcloud
				const deezerData = await playdl.deezer(args);
				if (deezerData.type == "track") {
				// search soundcloud
					const data = await playdl.search(args, { "limit":1, "source":{ "soundcloud":"tracks" } });
					// if data exists
					if (data && data[0]) {
					// add first result to queue
						AddSCdataToQueue(message, data[0]);
					}

				}
				else {
					message.react(reactions.confused);
					return false;
				}
			}
			else if (validate == "yt_video") {
			// get youtube video info
				const data = await playdl.video_basic_info(args);
				// add result to queue if data
				if (data && data.video_details) {
					addYTdataToQueue(message, data.video_details);
				}
				else {
					message.react(reactions.warning);
					return false;
				}

			}
			else {
				message.react(reactions.confused);
				return false;
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
	catch (error) {
		message.react(reactions.warning);
		message.reply("```play.js: " + error + "```");
		console.log(error);
	}
}

module.exports = play;