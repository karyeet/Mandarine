/*

Join -> voiceConnection
voiceConnection.subscribe(AudioPlayer)
audioPlayer plays AudioResource

per stream we want audioresource
create one per stream


*/
const { queue, audioPlayers, playNext, reactions, refreshSpotifyToken } = require("../general.js");

const { songAdded } = require("../presetEmbeds.js");

const { AudioPlayerStatus } = require("@discordjs/voice");

const playdl = require("play-dl");
const libmanger = require("../music/libraryManager.js");

const join = require("./join.js");
const unpause = require("./unpause.js");
// eslint-disable-next-line
// const ytRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;

async function convertSPDataToYT(spotifyData) {
	if (spotifyData && spotifyData.type == "track") {
		// search youtube
		const data = await playdl.search(`${spotifyData.artists[0].name} - ${spotifyData.name} topic`, { "limit":1, "source":{ "youtube":"video" } });
		// if result, return first result
		if (data && data[0]) {
			return data[0];
		}
		else {
			return false;
		}
	}
}

async function convertSPDataToDeezer(spotifyData) {
	if (spotifyData && spotifyData.type == "track") {
		// search deezer
		let data = false;
		try {
			if (spotifyData.isrc.length > 11) {
				data = await libmanger.requestTrack(`${spotifyData.isrc}`);
			}
		}
		catch (err) {
			console.log(err);
		}
		if (!data) {
			try {
				data = await libmanger.requestTrack(`${spotifyData.artists[0].name} - ${spotifyData.name}`);
			}
			catch (err) {
				console.log(err);
			}
		}
		// if result
		if (data && data.path) {
			// return data
			return data;
		}
		else {
			return false;
		}
	}
}


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

			setTimeout(() => {
				msg.delete()
					.catch((err) => {console.log("[NONFATAL] Failed to delete message", err);});
			}, 60000);

		});
}

function addYTdataToQueue(message, data, isPlayList) {
	const queueData = {
		"title":		data.title,
		"url": 			(data.video_url || data.url),
		"author": 		((data.author && data.author.name) ? data.author.name : data.channel.name),
		"durationInSec": (data.lengthSeconds || data.durationInSec),
		"thumbURL": 	data.thumbnails[data.thumbnails.length - 1].url,
		"type": 		"yt_track",
		"requester":	message.author,
		"channel": 		message.channel,
		"stream_url": 	(data.video_url || data.url),
	};
	queue[message.guild.id].push(queueData);
	message.react(reactions.positive);
	// send embed and delete after 60 seconds
	// dont send if playlist so we dont spam and get hit by ratelimit
	if (!isPlayList) {
		message.reply({ embeds:[songAdded(queueData, queue[message.guild.id].length - 1)] })
			.then(msg => {
				setTimeout(() => {
					msg.delete()
						.catch((err) => {console.log("[NONFATAL] Failed to delete message", err);});
				}, 60000);
			});
	}

}


function addDZdataToQueue(message, data, sendEmbed = true) {
	// console.log(data);
	const imageExists = data.metadata.common.picture && data.metadata.common.picture[0];
	const queueData = {
		"title":		data.metadata.common.title,
		"url": 			null,
		"author": 		data.metadata.common.artist,
		"durationInSec":(data.metadata.format.duration),
		"thumbURL": 	"attachment://thumb.jpg",
		"thumbData":	imageExists ? data.metadata.common.picture[0].data : false,
		"type": 		"dz_track",
		"requester":	message.author,
		"channel": 		message.channel,
		"stream_url": 	data.path,
	};
	queue[message.guild.id].push(queueData);
	if (sendEmbed) {
		message.react(reactions.positive);
		// send embed and delete after 60 seconds
		if (imageExists) {
			message.reply(
				{ embeds:[songAdded(queueData, queue[message.guild.id].length - 1)],
					files:[{ "name":"thumb.jpg", "attachment":data.metadata.common.picture[0].data }],
				})
				.then(msg => {
					setTimeout(() => {
						msg.delete()
							.catch((err) => {console.log("[NONFATAL] Failed to delete message", err);});
					}, 60000);
				});
		}
		else {
			message.reply(
				{ embeds:[songAdded(queueData, queue[message.guild.id].length - 1)],
				})
				.then(msg => {
					setTimeout(() => {
						msg.delete()
							.catch((err) => {console.log("[NONFATAL] Failed to delete message", err);});
					}, 60000);
				});
		}
	}


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
				// console.log(command);
				if (command == "music") {
				// search library; args == query
					const data = await libmanger.requestTrack(args);
					// console.log(data);
					// if no result then return false
					if (data && data.path) {
						// set to existing track or download the track
						addDZdataToQueue(message, data, true);
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
				await refreshSpotifyToken();
				const track = await playdl.spotify(args);
				// try to add via deezer
				const DZData = await convertSPDataToDeezer(track);
				if (DZData) {
					addDZdataToQueue(message, DZData, true);
				}
				else {
					// deezer didnt work try youtube
					const YTData = await convertSPDataToYT(track);
					if (YTData) {
						addYTdataToQueue(message, YTData);
					}
					else {
						message.react(reactions.confused);
						return false;
					}
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
				const data = await playdl.video_info(args);
				// add result to queue if data
				if (data && data.video_details) {
					addYTdataToQueue(message, data.video_details);
				}
				else {
					message.react(reactions.warning);
					return false;
				}

			}
			else if (validate == "yt_playlist") {
				// get youtube playlist info
				const pldata = await playdl.playlist_info(args, { incomplete : true });

				if (pldata && pldata.videoCount > 0) {
					const videos = await pldata.all_videos();
					if (videos) {
						// add result to queue if data
						let length = 0;
						for (const i in videos) {
							const video = videos[i];
							length += video.durationInSec;
							addYTdataToQueue(message, video, true);
						}
						// mock song data to create embed
						const queueData = {
							"title":		pldata.title,
							"url": 			pldata.url || pldata.link,
							"author": 		pldata.channel.name,
							"durationInSec": length,
							"thumbURL": 	videos[0].thumbnails[videos[0].thumbnails.length - 1].url,
							"type": 		"yt_track",
							"requester":	message.author,
							"channel": 		message.channel,
							"stream_url": 	pldata.url || pldata.link,
						};
						message.reply({ embeds:[songAdded(queueData, queue[message.guild.id].length - 1)] })
							.then(msg => {
								setTimeout(() => {
									msg.delete()
										.catch((err) => {console.log("[NONFATAL] Failed to delete message", err);});
								}, 60000);
							});
						// end of mock
					}
				}
				else {
					message.react(reactions.warning);
					return false;
				}

			}
			else if (validate == "sp_playlist" || validate == "sp_album") {
				// get spotify playlist info
				await refreshSpotifyToken();
				const spotifyData = await playdl.spotify(args);

				if (spotifyData && spotifyData.tracksCount > 0) {
					const tracks = await spotifyData.all_tracks();
					if (tracks) {
						// ask user to wait
						const replyMessage = await message.reply(`Adding ${validate.replace("sp_", "")} to queue, this might take a couple seconds!`);
						// add result to queue if data
						let length = 0;
						for (const i in tracks) {
							const track = tracks[i];
							length += track.durationInSec;
							// try to add via deezer
							const DZData = await convertSPDataToDeezer(track);
							if (DZData) {
								addDZdataToQueue(message, DZData, false);
							}
							else {
								// deezer didnt work try spotify
								const YTData = await convertSPDataToYT(track);
								addYTdataToQueue(message, YTData, true);
							}
						}
						// mock song data to create embed
						let author = "Spotify";
						if (validate == "sp_playlist") {
							author = spotifyData.owner.name;
						}
						else if (validate == "sp_album") {
							author = spotifyData.artists[0].name;
							for (let i = 1; i < spotifyData.artists.length; i++) {
								author = author + ", " + spotifyData.artists[i].name;
							}
						}
						const queueData = {
							"title":		spotifyData.name,
							"url": 			spotifyData.url || spotifyData.link,
							"author": 		author,
							"durationInSec": length,
							"thumbURL": 	spotifyData.thumbnail.url,
							"type": 		"yt_track",
							"requester":	message.author,
							"channel": 		message.channel,
							"stream_url": 	spotifyData.url || spotifyData.link,
						};
						// remove original reply
						replyMessage.delete()
							.catch((err) => {console.log("[NONFATAL] Failed to delete message", err);});
						// reply with added to queue message
						message.reply({ embeds:[songAdded(queueData, queue[message.guild.id].length - 1)] })
							.then(msg => {
								setTimeout(() => {
									msg.delete()
										.catch((err) => {console.log("[NONFATAL] Failed to delete message", err);});
								}, 60000);
							});
						// end of mock
					}
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

		return true;

	}
	catch (error) {
		message.react(reactions.warning);
		message.reply("```play.js: " + error + "```");
		console.log(error);
	}
}

module.exports = play;