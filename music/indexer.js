/*
	Only to be run seperatly when importing new music files
	Very basic

*/


const fs = require("fs");
const localLibrary = require("./localLibrary.json");
const { read } = require("node-id3");

const homedir = require("os").homedir();
const pathToFiles = homedir + "/manderineFiles/";

/*

{
	"filename":{
		"artist":"artistName"
		"title:":"songTitle"
	}
}

*/

fs.readdir(pathToFiles, async function(err, files) {
	if (err) throw err;
	console.log(files);
	for (let i = 0; i < files.length; i++) {
		const fileName = files[i];
		console.log(fileName);
		// only support mp3
		if (fileName.endsWith(".mp3")) {
			if (!localLibrary[fileName]) {
				read("./files/" + fileName, function(err, tags) {
					if (err) throw err;
					console.log("tags");
					localLibrary[fileName] = {
						"title": tags.title,
						"artist": tags.artist,
						"search": fileName.replace(/\.mp3$/, ""),
					};
					if (i == files.length - 1) {
						write();
					}
				});
			}
		}

	}
});

function write() {
	console.log(localLibrary);
	fs.writeFileSync("./localLibrary.json", JSON.stringify(localLibrary));
}