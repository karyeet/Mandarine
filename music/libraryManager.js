/*
	library manager for finding files and faciliting deezer downloads

*/


const fs = require("fs");
const localLibrary = require("./localLibrary.json");

const FuzzySet = require('fuzzyset')

const homedir = require("os").homedir();
let parseFile;
import('music-metadata').then((mmModule)=>{parseFile = mmModule.parseFile});
const meezer = require("./meezer.js");
const path = require("path");

const pathToFiles = path.join(homedir, "/mandarineFiles/");

/*

{
	"filename.mp3":{
		"artist":"artistName"
		"title:":"songTitle"
		"search":"filename"
	}
}

*/

function createFuzzySetArr(){
	const fzpromise = new Promise((resolve, reject)=>{
		const arr = [];
		for (const key in localLibrary){
			const searchTerm = localLibrary[key].search;
			arr.push(searchTerm)
		}
		resolve(arr);
	})
	return fzpromise;
}

async function requestTrack(query) {
	// get array of files and create new fuzzy object, only use search key
	const fuzzyArr = await createFuzzySetArr();
	const fuzzySet = new FuzzySet(fuzzyArr);

	// perform search
	const fuzzyResult = fuzzySet.get(query);
	// if valid match, return filename
	if (fuzzyResult && fuzzyResult[0]) {
		console.log("fuzzy found");
		console.log(fuzzyResult);
		for (const index in fuzzyArr){
			if(fuzzyArr[index] == fuzzyResult[0][1]){
				const fuzzyfilepath = path.join(pathToFiles, Object.keys(localLibrary)[index]);
				return {
					"path":fuzzyfilepath,
					"metadata": await parseFile(fuzzyfilepath),
				};
			}
		}

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
		"search": (title + " " + artist).replace(".","").replace("'","").replace("-",""),
	};
	fs.writeFileSync(path.join(__dirname, "localLibrary.json"), JSON.stringify(localLibrary));
}

console.log(pathToFiles);
/* async function test() {
	console.log(await requestTrack("metro boomin superhero"));
}*/
// test();
// console.log(parseFile(path.join(pathToFiles, "Metro Boomin - Superhero (Heroes & Villains).mp3")));

module.exports = { requestTrack };