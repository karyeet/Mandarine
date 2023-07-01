/*
	library manager for finding files and faciliting deezer downloads

*/


const fs = require("fs");
const localLibrary = require("./localLibrary.json");

const FuzzySet = require("fuzzyset");

const homedir = require("os").homedir();
let parseFile;
import("music-metadata").then((mmModule) => {
	parseFile = mmModule.parseFile;
});

const meezer = require("./meezer.js");
const path = require("path");

const pathToDLFiles = path.join(homedir, "/mandarineFiles/");

/*

{
	"filename.mp3":{
		"artist":"artistName"
		"title:":"songTitle"
		"search":"filename"
	}
}

*/

function createFuzzySetArr() {
	const fzpromise = new Promise((resolve) => {
		const arr = [];
		for (const key in localLibrary) {
			for (const index in localLibrary[key].search) {
				const searchTerm = localLibrary[key].search[index];
				arr.push(searchTerm);
				// console.log("search term "+searchTerm)
			}
		}
		resolve(arr);
	});
	return fzpromise;
}

async function requestTrack(query) {
	// get array of files and create new fuzzy object, only use search key
	const fuzzyArr = await createFuzzySetArr();
	const fuzzySet = new FuzzySet(fuzzyArr);

	// perform search
	const fuzzyResult = fuzzySet.get(query);
	console.log(fuzzyResult);

	// if valid match, return filename
	if (fuzzyResult && fuzzyResult[0] && (console.log(fuzzyResult[0][0]) || true) && fuzzyResult[0][0] > 0.77) {
		console.log("fuzzy found");
		for (const key in localLibrary) {
			if (localLibrary[key].search.find(pattern => pattern == fuzzyResult[0][1])) {
				// const fuzzyfilepath = path.join(pathToFiles, key);
				const fuzzyfilepath = path.join(key);
				console.log(fuzzyfilepath);
				return {
					"path":fuzzyfilepath,
					"metadata": await parseFile(fuzzyfilepath),
				};
			}
		}

	}
	// otherwise perform deezer track fetch (no explicit else)
	console.log("fuzzy fail");
	const result = await meezer.searchTrack(query);
	// track not found then return false
	if (!result || !result.link) {
		console.log("Track not found");
		return false;
	}
	//  before download, see if track exists and fuzzy missed it
	const trackExists = meezer.trackExists(result.artist.name, result.title);
	if (trackExists) {
		console.log("track exist");
		return {
			"metadata": await parseFile(trackExists),
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
			"metadata":await parseFile(trackDL.path),
			"path": trackDL.path,
		};
	}
	else {
		// trackdl returned a nontrue value
		console.log("track not found");
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
	const search = [
		(title).replace(/\.|'|-/g, ""),
	];

	if (artist.split(" ").length > 1) {
		// if the artist has spaces in their names, chances are people will only add one part of their name
		for (const artistNameSplit of artist.split(" ")) {
			search.push((title + " " + artistNameSplit).replace(/\.|'|-/g, ""));
			search.push((artistNameSplit + " " + title).replace(/\.|'|-/g, ""));
		}
	}
	else {
		// otherwise just add the artist name normally
		search.push((title + " " + artist).replace(/\.|'|-/g, ""));
		search.push((artist + " " + title).replace(/\.|'|-/g, ""));
	}

	if (search[2] != (title).replace(/\(.*\)|\.|'|-/g, "")) {
		search.push((title).replace(/\(.*\)|\.|'|-/g, ""));
	}
	localLibrary[path.join(pathToDLFiles, fileName)] = {
		"title": title,
		"artist": artist,
		"search": search,
	};
	fs.writeFileSync(path.join(__dirname, "localLibrary.json"), JSON.stringify(localLibrary));
}

console.log(pathToDLFiles);
/* async function test() {
	console.log(await requestTrack("metro boomin superhero"));
}*/
// test();
// console.log(parseFile(path.join(pathToFiles, "Metro Boomin - Superhero (Heroes & Villains).mp3")));
/* setTimeout(()=>{
	requestTrack("metro spider")
}, 1_000)
*/

/* addToLibrary("foo", "bar", "foobar.mp3")*/

module.exports = { requestTrack };