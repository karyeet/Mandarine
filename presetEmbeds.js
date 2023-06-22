const mEmbeds = require("./mEmbeds.js");

// default
const defaultEmbed = new mEmbeds();

defaultEmbed.setColor("#FFA500");

defaultEmbed.setDefault();

// song added to queue

/* "guilid": [{
	title: "Megolovania",
	url: "https://www.youtube.com/watch?v=WibFGyDMmYA"
	author: "Toby Fox",
	durationInSec: "5:13",
	thumbURL: "",
	type: "yt_track",
	requester,
	textchannel,
}]*/

function secondsToTime(seconds) {
	if ((seconds % 60) < 10) {
		return Math.floor(seconds / 60) + ":0" + Math.floor(seconds % 60);
	}
	else {
		return Math.floor(seconds / 60) + ":" + Math.floor(seconds % 60);
	}
}

function songAdded(queueInfo, index) {
	const songAddedEmbed = new mEmbeds(queueInfo.requester);
	if (index) {
		songAddedEmbed.setTitle(`Added to Queue, #${index}`);
	}
	else {
		songAddedEmbed.setTitle("Added to Queue");
	}

	if (queueInfo.url) {
		songAddedEmbed.setDesc("[" + queueInfo.title + "](" + queueInfo.url + ")");
	}
	else {
		songAddedEmbed.setDesc(queueInfo.title);
	}

	songAddedEmbed.setThumb(queueInfo.thumbURL);
	songAddedEmbed.addField("Artist", queueInfo.author, true);
	songAddedEmbed.addField("Length", secondsToTime(queueInfo.durationInSec), true);
	return songAddedEmbed.embed.embed;
}

// now playing, not used because we change bot nickname

function nowPlaying(queueInfo) {
	const nowPlayingEmbed = new mEmbeds(queueInfo.requester);
	nowPlayingEmbed.setTitle("Now Playing");

	if (queueInfo.url) {
		nowPlayingEmbed.setDesc("[" + queueInfo.title + "](" + queueInfo.url + ")");
	}
	else {
		nowPlayingEmbed.setDesc(queueInfo.title);
	}

	nowPlayingEmbed.setThumb(queueInfo.thumbURL);
	nowPlayingEmbed.addField("Artist", queueInfo.author, true);
	nowPlayingEmbed.addField("Length", secondsToTime(queueInfo.durationInSec), true);
	return nowPlayingEmbed.embed.embed;
}

const maxItemsPerPage = 4;
function CalcQueuePages(queueLength) {
	let pages = Math.ceil((queueLength - 1) / maxItemsPerPage);
	if (pages === 0) {
		pages = 1;
	}
	return pages;
}

function queueGen(user, page, guildQueue, guildMeta) {
	const queueEmbed = new mEmbeds(user);

	let totalDurationInSec = 0;
	for (const track of guildQueue) {
		totalDurationInSec += track.durationInSec;
	}

	queueEmbed.setTitle("Queue | Duration: " + secondsToTime(totalDurationInSec) + " | Page: " + page + "/" + CalcQueuePages(guildQueue.length));

	if (guildQueue[0].url) {
		queueEmbed.setDesc("**Currently Playing**: [" + guildQueue[0].title + "](" + guildQueue[0].url + ")");
	}
	else {
		queueEmbed.setDesc("**Currently Playing**: " + guildQueue[0].title);
	}

	queueEmbed.setThumb(guildQueue[0].thumbURL);
	queueEmbed.addField("Artist", guildQueue[0].author, true);
	queueEmbed.addField("Length", secondsToTime(guildQueue[0].durationInSec), true);
	if (guildMeta.looping) {
		queueEmbed.addField("Looping", "True", true);
	}
	if (guildMeta.volume != 1) {
		queueEmbed.addField("Volume", guildMeta.volume, true);
	}
	if (guildMeta.spotify) {
		queueEmbed.addField("Spotify", `<@${guildMeta.spotify}>`, true);
	}
	// if maxItemsPerPage = 7
	// each page will be 9 fields, minimum page is 0, nowplaying fields are 0-1, queue fields are 2-9, for a total of 7 queue items
	// set i to ((page-1) * 7) + 1, while i is less than or equal to (page-1) * 7 + 7 and i is less than the guildqueue length, add a field
	// so this will loop through 1-7, 8-14
	for (let i = (page - 1) * maxItemsPerPage + 1; i <= ((page - 1) * maxItemsPerPage) + maxItemsPerPage && i < guildQueue.length; i++) {

		if (guildQueue[i].url) {
			queueEmbed.addField("#" + i, "[" + guildQueue[i].title + "](" + guildQueue[i].url + ") || " + secondsToTime(guildQueue[i].durationInSec), false);
		}
		else {
			queueEmbed.addField("#" + i, guildQueue[i].title + " || " + secondsToTime(guildQueue[i].durationInSec), false);
		}


	}

	return queueEmbed.embed.embed;
}

function helpGen(user, prefix = ">") {
	const helpEmbed = new mEmbeds(user);

	helpEmbed.setTitle("Commands");
	helpEmbed.setDesc(`Replace brackets & stuff inside brackets with what they're describing.
	Ex: ">play [search]" would be ">play my favorite song"`);

	helpEmbed.addField(prefix + "join", "Make bot join VC.", false);
	helpEmbed.addField(prefix + "disconnect or >leave", "Make bot leave VC.", false);
	helpEmbed.addField(prefix + "play [link] or >play [search]", "Play audio using a link from spotify, soundcloud, or youtube OR search and play from youtube.", false);
	helpEmbed.addField(prefix + "music [search]", "Play a song from a library of high quality songs. Some songs may be fetched on request & may take a couple seconds to play.", false);
	helpEmbed.addField(prefix + "pause or " + prefix + "stop", "Pause audio playback.", false);
	helpEmbed.addField(prefix + "resume or " + prefix + "unpause", "Resume audio playback. >play will also work.", false);
	helpEmbed.addField(prefix + "skip", "Skip the currently playing track.", false);
	helpEmbed.addField(prefix + "queue", "Show tracks in the queue.", false);
	helpEmbed.addField(prefix + "remove [index]", "Remove a track from the queue using the index number shown in the queue command. This number may change everytime you remove a track.", false);
	helpEmbed.addField(prefix + "loop", "Loop or unloop the current track.", false);
	helpEmbed.addField(prefix + "spotify [mention]", "Listen along to a user whose spotify is linked and sharing to discord.", false);

	return helpEmbed.embed.embed;
}

module.exports = { helpGen, songAdded, nowPlaying, queueGen, CalcQueuePages };