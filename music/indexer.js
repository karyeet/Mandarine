/*
	Only needs to be run seperatly when importing new music files
	Very basic

*/


const fs = require("fs/promises");
const localLibrary = {};

const homedir = require("os").homedir();
const path = require("path");

const pathToDLFiles = path.join(homedir, "mandarineFiles");

const config = require("../config.json");

let parseFile;
let fileCount = 0;
let dirCount = 0;

// import('music-metadata').then((mmModule)=>{console.log("mm: " + mmModule); parseFile = mmModule.parseFile});


async function indexDirectory(directory) {
	const files = await fs.readdir(directory, { withFileTypes: true });
	for (const file of files) {
		if (file.isDirectory()) {
			await indexDirectory(path.join(directory, file.name));
			dirCount++;
		}
		else if (file.name.endsWith(".mp3")) {
			await addFile(path.join(directory, file.name));
			fileCount++;
		}
	}
	return true;
}

async function addFile(filePath) {

	if (!localLibrary[filePath]) {
		const metadata = await parseFile(filePath);
		// console.log("metadata:" + JSON.stringify(metadata.common.title));
		const title = metadata.common.title;
		const artist = metadata.common.artist;

		const search = [
			(title).replace(/\.|'|-/g, ""),
			(artist + " " + title).replace(/\.|'|-/g, ""),
			(title + " " + artist).replace(/\.|'|-/g, ""),
		];

		const featSplitRegex = / feat\.? /;
		if (title.match(featSplitRegex)) {
			search.push(title.split(featSplitRegex)[0]);
		}

		if (metadata.common.isrc && metadata.common.isrc[0]) {
			search.push(metadata.common.isrc[0]);
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

		localLibrary[filePath] = {
			"title": title,
			"artist": artist,
			"search": search,
		};

	}
}

async function write() {
	// console.log(localLibrary);
	await fs.writeFile(path.join(__dirname, "localLibrary.json"), JSON.stringify(localLibrary));
	return true;
}

async function index() {
	const musicmetadata = await import("music-metadata");
	parseFile = musicmetadata.parseFile;

	if (config.additionalMusicDirs) {
		for (const dir of config.additionalMusicDirs) {
			console.log("Indexing " + dir + " and its subdirectories.");
			await indexDirectory(dir);
		}
	}
	console.log("Indexing " + pathToDLFiles + " and its subdirectories.");
	await indexDirectory(pathToDLFiles);
	console.log("write");
	console.log("Indexed " + fileCount + " files in " + dirCount + " folders.");
	await write();
	return 1;
}


if (require.main === module) {
	// called directly
	index();
}

module.exports = { index };