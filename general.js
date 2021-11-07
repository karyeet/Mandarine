const playdl = require("play-dl");
const { createAudioResource } = require("@discordjs/voice");

const https = require("https");

const queue = {
	"guilid":["youtube-link1", "youtube-link2"] };

/* "guilid": audioPlayer*/
const audioPlayers = { };

let SC_clientId;

async function playNext(message) {
	const playdlStream = await playdl.stream(queue[message.guild.id][0]);

	// get type of stream to see if we need to attach listeners
	const streamType = await playdl.validate(queue[message.guild.id][0]);
	if (streamType == "yt_video" || streamType == "so_track") {

		playdl.attachListeners(audioPlayers[message.guildId], playdlStream);

	}

	const audioResource = createAudioResource(playdlStream.stream, playdlStream.type);
	audioPlayers[message.guildId].play(audioResource);
}

// set SC client id every start so it doesnt expire
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

// search sc cause play-dl doesnt have it
function searchSC(args) {
	const url = "https://api-v2.soundcloud.com/search?client_id=" + SC_clientId + "&limit=1&q=";
	const sc_promise = new Promise((resolve) => {
		https.get(url + encodeURIComponent(args), (res) => {
			res.setEncoding("utf8");
			const data = [];
			res.on("data", (chunk) => {
				data.push(chunk);
			});
			res.once("end", () => {
				resolve(JSON.parse(data.join("")));
			});
		});
	});
	return sc_promise;
}

module.exports = { queue, audioPlayers, playNext, searchSC };