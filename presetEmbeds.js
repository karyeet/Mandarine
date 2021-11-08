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

module.exports = { songAdded, nowPlaying };