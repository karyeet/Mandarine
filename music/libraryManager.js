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

// get array of files and create new fuzzy object, only use search key
let fuzzySet;
createFuzzySetArr().then((arr) => {
	fuzzySet = new FuzzySet(arr);
});


async function requestTrack(query) {

	// perform search
	console.log("fuzzy search");
	const fuzzyResult = await fuzzySet.get(query);
	console.log(fuzzyResult);


	let threshold = 0.77;
	const isISRC = query.match(/^[A-Z]{2}-?\w{3}-?\d{2}-?\d{5}$/);
	if (isISRC) {
		threshold = 1;
	}

	// if valid match, return filename
	if (fuzzyResult && fuzzyResult[0] && (console.log(fuzzyResult[0][0]) || true) && fuzzyResult[0][0] > threshold) {
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
	let result = false;
	try {
		result = await meezer.searchTrack(query);
	}
	catch (err) {
		console.log(err);
	}
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
		const metadata = await parseFile(trackDL.path);
		let isrc = false;
		if (metadata.common.isrc && metadata.common.isrc[0]) {
			isrc = metadata.common.isrc[0];
		}
		addToLibrary(result.artist.name, result.title, isrc, trackDL.fileName);
		return {
			"metadata": metadata,
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

function addToLibrary(artist, title, isrc, fileName) {
	const search = [
		(title).replace(/\.|'|-/g, ""),
		(artist + " " + title).replace(/\.|'|-/g, ""),
		(title + " " + artist).replace(/\.|'|-/g, ""),
	];


	const featSplitRegex = / feat\.? /;
	if (title.match(featSplitRegex)) {
		search.push(title.split(featSplitRegex)[0]);
	}

	if (isrc) {
		search.push(isrc);
	}

	if (artist.split(" ").length > 1) {
		// if the artist has spaces in their names, chances are people will only add one part of their name
		for (const artistNameSplit of artist.split(" ")) {
			search.push((title + " " + artistNameSplit).replace(/\.|'|-/g, ""));
			search.push((artistNameSplit + " " + title).replace(/\.|'|-/g, ""));
		}
	}

	if (search[2] != (title).replace(/\(.*\)|\.|'|-/g, "")) {
		search.push((title).replace(/\(.*\)|\.|'|-/g, ""));
	}

	localLibrary[path.join(pathToDLFiles, fileName)] = {
		"title": title,
		"artist": artist,
		"search": search,
	};
	// add to fuzzy set
	for (const searchItem of search) {
		fuzzySet.add(searchItem);
	}

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