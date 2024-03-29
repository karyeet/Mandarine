// Contains functions & tables used by multiple scripts in the project

const playdl = require("play-dl");
const { createAudioResource, StreamType } = require("@discordjs/voice");
const { createReadStream, existsSync } = require("fs");
const path = require("path");

const reactions = {
	"positive":"🍊",
	"negative":"👎",
	"confused":"⁉️",
	"warning":"⚠️",
	"repeat":"🔂",
	"next_track":"⏭️",
	"speaking":"🗣️",
};

/* "guilid": [{
	title: "Megolovania",
	url: "https://www.youtube.com/watch?v=WibFGyDMmYA"
	author: "Toby Fox",
	length: "5:13",
	thumbURL: "",
	type: "yt_track"
	stream_url: "https://www.youtube.com/watch?v=WibFGyDMmYA" or "/home/music/file.mp3"
}]*/
const queue = {};

// guildMeta for information about guilds
/*
"looping": false,
"volume": 1,
"spotify": false, // when spotify is set, it will be the userid
"summonMessage":message
*/
const guildsMeta = {};

// "guilid": audioPlayer
const audioPlayers = {};

async function playNext(message) {
	try {

		// if the queue item doesnt exist dont bother playing
		if (!queue[message.guild.id] || !queue[message.guild.id][0] || !queue[message.guild.id][0].stream_url) {
			return false;
		}

		// set resource out of scope
		let audioResource;

		console.log("Stream url: " + queue[message.guild.id][0].stream_url);
		console.log("url: " + queue[message.guild.id][0].url);

		// get type of stream to see if we need to attach listeners
		const streamType = queue[message.guild.id][0].type;
		console.log("stream type " + streamType);
		if (streamType == "so_track") {
		// create playdl stream
			const audioStream = await playdl.stream(queue[message.guild.id][0].stream_url);
			// attach listeners to playdl for "proper  functionality"
			playdl.attachListeners(audioPlayers[message.guildId], audioStream);
			console.log("attached listeners");
			// create audio resource
			audioResource = createAudioResource(audioStream.stream, { inputType: audioStream.type });
		}
		else if (streamType == "dz_track") {
			console.log("recognized dz_track");
			const audioStream = createReadStream(queue[message.guild.id][0].stream_url);
			audioResource = createAudioResource(audioStream, { inputType: StreamType.Arbitrary });
		}
		else if (streamType == "yt_video" || streamType == "yt_track") {
			/* const audioStream = ytdl(queue[message.guild.id][0].stream_url, {
				quality:"highestaudio",
				filter: "audioonly",
				highWaterMark: 1 << 25,
			});*/

			const audioStream = await playdl.stream(queue[message.guild.id][0].stream_url, {
				"quality:": 2,
			});
			// attach listeners to playdl for "proper  functionality"
			playdl.attachListeners(audioPlayers[message.guildId], audioStream);
			console.log("attached listeners");
			// create audio resource
			audioResource = createAudioResource(audioStream.stream, { inputType: audioStream.type });

		}

		// play the audio resource for the current playdl stream // need to check docs for play-dl and input type
		console.log("created audioresource");
		audioPlayers[message.guildId].play(audioResource);
		console.log("playing resource");
		message.guild.me.setNickname(queue[message.guild.id][0].title.substring(0, 31));
	}
	catch (error) {
		/* If an error happens while trying to play a song,
		we must skip the song here in order to allow the bot to resume
		this is because discordjs will not fire the idle event if it never starts streaming */
		message.react(reactions.warning);
		message.reply("```general.js: " + error + "```");
		console.log(error);
		console.log("Error while playing song, skipping song.");
		queue[message.guild.id].shift();
		playNext(message);
	}
}

// set SC client id every start so it doesnt expire
let SC_clientId;
async function setScClientId() {
	try {
		console.log("Refreshing soundcloud token");
		SC_clientId = await playdl.getFreeClientID();

		playdl.setToken({
			soundcloud : {
				client_id : SC_clientId,
			},
		});
	// console.log("SC ID: " + SC_clientId);
	}
	catch (err) {
		console.log("Error while refreshing Soundcloud ID!\n", err);
	}
}

async function refreshSpotifyToken() {
	const dataFolderPath = path.join(__dirname, ".data");
	const spotifyFilePath = path.join(dataFolderPath, "spotify.data");
	if (existsSync(dataFolderPath) && existsSync(spotifyFilePath)) {
		console.log("Refreshing spotify token");
		if (playdl.is_expired()) {
			try {
				await playdl.refreshToken();
			}
			catch (err) {
				console.log("Spotify authentication failed! Please reauthenticate.\n" + err);
				return false;
			}
			return true;
		}
	}
	else {
		console.log("Spotify not yet configured, skipping refresh.");
		return false;
	}
}

setScClientId();


refreshSpotifyToken();

// set sc id every 10 minutes
setInterval(setScClientId, 10 * 60 * 1000);
// refresh spotify token every 55 minutes
setInterval(refreshSpotifyToken, 55 * 60 * 1000);

module.exports = { queue, audioPlayers, playNext, reactions, guildsMeta, refreshSpotifyToken };