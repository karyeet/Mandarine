/*
	library manager for finding files and faciliting deezer downloads

*/


const fs = require("fs");
const localLibrary = require("./localLibrary.json");
const Fuse = require("fuse.js");
const homedir = require("os").homedir();
const { read } = require("node-id3");
const meezer = require("./meezer.js");
const path = require("path");

const pathToFiles = path.join(homedir, "/manderineFiles/");

/*

{
	"filename.mp3":{
		"artist":"artistName"
		"title:":"songTitle"
		"search":"filename"
	}
}

*/

async function requestTrack(query) {
	// get array of files and create new fuse object, only use search key
	const fuse = new Fuse(Object.values(localLibrary),
		{
			"keys": ["search"],
			includeScore: true,
			threshold: 0.2,
		});
	// perform search

	const fuseResult = fuse.search(query);
	// if valid match, return filename
	// console.log(fuseResult);
	if (fuseResult[0]) {
		console.log("fuse found");
		console.log(fuseResult);
		const fusefilepath = path.join(pathToFiles, fuseResult[0].item.search + ".mp3");
		return {
			"path":fusefilepath,
			"metadata":read(fusefilepath),
		};
	}
	// otherwise perform deezer track fetch (no explicit else)
	const result = await meezer.searchTrack(query);
	// track not found then return false
	if (!result || !result.link) {
		return false;
	}
	// see if track exists and fuse missed it
	const trackExists = meezer.trackExists(result.artist.name, result.title);
	if (trackExists) {
		console.log("track exist");
		return {
			"metadata":read(trackExists),
			"path": trackExists,
		};
	}
	// at this point track does not exist, start download!
	const trackDL = await meezer.DownloadTrack(result.link);

	if (trackDL) {
		// successfull download so add to library and return filename
		console.log("trackdl");
		addToLibrary(result.artist.name, result.title, trackDL.fileName);
		return {
			"metadata":read(trackDL.path),
			"path": trackDL.path,
		};
	}
	else {
		// trackdl returned a nontrue value
		return false;
	}


}

/* function addDZdataToQueue(message, data) {
	const queueData = {
		"title":		data.title,
		"url": 			data.link,
		"author": 		data.artist.name,
		"durationInSec":data.duration,
		"thumbURL": 	data.album.cover_medium,
		"type": 		"dz_track",
		"requester":	message.author,
		"channel": 		message.channel,
		"stream_url": 	data.fileLocation,
	};*/

function addToLibrary(artist, title, fileName) {
	localLibrary[fileName] = {
		"title": title,
		"artist": artist,
		"search": fileName.replace(/\.mp3$/, ""),
	};
	fs.writeFileSync(path.join(__dirname, "localLibrary.json"), JSON.stringify(localLibrary));
}

console.log(pathToFiles);
/* async function test() {
	console.log(await requestTrack("metro boomin superhero"));
}*/
// test();
// console.log(read(path.join(pathToFiles, "Metro Boomin - Superhero (Heroes & Villains).mp3")));

module.exports = { requestTrack };