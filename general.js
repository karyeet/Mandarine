// Contains functions & tables used by multiple scripts in the project

const playdl = require("play-dl");
const { createAudioResource } = require("@discordjs/voice");

const reactions = {
	"positive":"🍊",
	"negative":"👎",
	"confused":"⁉️",
};

/* "guilid": [{
	title: "Megolovania",
	url: "https://www.youtube.com/watch?v=WibFGyDMmYA"
	author: "Toby Fox",
	length: "5:13",
	thumbURL: "",
	type: "yt_track"
}]*/
const queue = {};

// "guilid": audioPlayer
const audioPlayers = {};

async function playNext(message) {
	// create playdl stream
	const playdlStream = await playdl.stream(queue[message.guild.id][0].url);

	// get type of stream to see if we need to attach listeners
	const streamType = await playdl.validate(queue[message.guild.id][0].url);
	if (streamType == "yt_video" || streamType == "so_track") {
		// attach listeners to playdl for "proper  functionality"
		playdl.attachListeners(audioPlayers[message.guildId], playdlStream);
		console.log("attached listeners");

	}
	// create and play the audio resource for the current playdl stream // need to check docs for play-dl and input type
	const audioResource = createAudioResource(playdlStream.stream, { inputType: playdlStream.type });
	console.log("created audioresource");
	audioPlayers[message.guildId].play(audioResource);
	console.log("playing resource");
	message.guild.me.setNickname(queue[message.guild.id][0].title.substring(0, 31));
}

// set SC client id every start so it doesnt expire
let SC_clientId;
async function setScClientId() {
	SC_clientId = await playdl.getFreeClientID();

	playdl.setToken({
		soundcloud : {
			client_id : SC_clientId,
		},
	});
	console.log("SC ID: " + SC_clientId);
}

setScClientId();
// set sc id every 5 minutes
setInterval(setScClientId, 5 * 60 * 1000);

module.exports = { queue, audioPlayers, playNext, reactions };