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
		return Math.floor(seconds / 60) + ":0" + seconds % 60;
	}
	else {
		return Math.floor(seconds / 60) + ":" + seconds % 60;
	}
}

function songAdded(queueInfo) {
	const songAddedEmbed = new mEmbeds(queueInfo.requester);
	songAddedEmbed.setTitle("Added to Queue");
	songAddedEmbed.setDesc("[" + queueInfo.title + "](" + queueInfo.url + ")");
	songAddedEmbed.setThumb(queueInfo.thumbURL);
	songAddedEmbed.addField("Author", queueInfo.author, true);
	songAddedEmbed.addField("Length", secondsToTime(queueInfo.durationInSec), true);
	return songAddedEmbed.embed.embed;
}

// now playing

function nowPlaying(queueInfo) {
	const nowPlayingEmbed = new mEmbeds(queueInfo.requester);
	nowPlayingEmbed.setTitle("Now Playing");
	nowPlayingEmbed.setDesc("[" + queueInfo.title + "](" + queueInfo.url + ")");
	nowPlayingEmbed.addField("Author", queueInfo.author, true);
	nowPlayingEmbed.addField("Length", secondsToTime(queueInfo.durationInSec), true);
	return nowPlayingEmbed.embed.embed;
}

const maxFieldsPerPage = 2;
function CalcQueuePages(queueLength) {
	return Math.ceil((queueLength - 1) / maxFieldsPerPage);
}

function queueGen(user, guildQueue, page) {
	const queueEmbed = new mEmbeds(user);
	queueEmbed.setTitle("Queue, Page: " + page + "/" + CalcQueuePages(guildQueue.length));
	queueEmbed.setDesc("**Currently Playing**: [" + guildQueue[0].title + "](" + guildQueue[0].url + ")");
	queueEmbed.addField("Author", guildQueue[0].author, true);
	queueEmbed.addField("Length", secondsToTime(guildQueue[0].durationInSec), true);

	// each page will be 17 fields, minimum page is 0, nowplaying fields are 0-1, queue fields are 2-16, for a total of 15 queue items
	// set i to page * 14, while i is less than or equal to page*14+14 and i is less than the guildqueue length, add a field
	// so this will loop through 0-14, 15-
	for (let i = (page - 1) * maxFieldsPerPage + 1; i <= ((page - 1) * maxFieldsPerPage) + maxFieldsPerPage && i < guildQueue.length; i++) {
		queueEmbed.addField("#" + i, "[" + guildQueue[i].title + "](" + guildQueue[i].url + ") || " + secondsToTime(guildQueue[i].durationInSec), false);
	}

	return queueEmbed.embed.embed;
}

module.exports = { songAdded, nowPlaying, queueGen, CalcQueuePages };