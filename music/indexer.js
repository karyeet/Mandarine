/*
	Only to be run seperatly when importing new music files
	Very basic

*/


const fs = require("fs");
const localLibrary = require("./localLibrary.json");

const homedir = require("os").homedir();
const pathToFiles = homedir + "/mandarineFiles/";

const path = require("path");

let parseFile;
// import('music-metadata').then((mmModule)=>{console.log("mm: " + mmModule); parseFile = mmModule.parseFile});

fs.readdir(pathToFiles, async function(err, files) {

	if (err) throw err;
	console.log(files);
	let musicmetadata = await import("music-metadata");
	parseFile = musicmetadata.parseFile
	for (let i = 0; i < files.length; i++) {
		const fileName = files[i];
		console.log(fileName);
		// only support mp3
		await addFile(fileName);
		if (i == files.length - 1) {
			console.log("write");
			setTimeout(() => {
				write();
			}, 3_000);
		}
	}
});

async function addFile(fileName) {
	if (fileName.endsWith(".mp3")) {
		if (!localLibrary[fileName]) {
			const metadata = await parseFile(path.join(pathToFiles, fileName));
			console.log("metadata:" + JSON.stringify(metadata.common.title))
			const title = metadata.common.title;
			const artist = metadata.common.artist;
			localLibrary[fileName] = {
				"title": title,
				"artist": artist,
				"search": [
					(title + " " + artist).replace(/\.|'|-/g, ""), //.replace(".","").replace("'","").replace("-",""),
					(artist + " " + title).replace(/\.|'|-/g, ""), //.replace(".","").replace("'","").replace("-",""),
					(title).replace(/\.|'|-/g, ""),//.replace(".","").replace("'","").replace("-",""),
					(title).replace(/\(.*\)|\.|'|-/g, ""),//replace(".","").replace("'","").replace("-","").replace(/\(.*\)/g, ""),
				],
			};


		}
	}
}

function write() {
	console.log(localLibrary);
	fs.writeFileSync(path.join(__dirname, "localLibrary.json"), JSON.stringify(localLibrary));
}