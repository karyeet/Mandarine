/*
	Only to be run seperatly when importing new music files
	Very basic

*/


const fs = require("fs");
const localLibrary = require("./localLibrary.json");
const { read } = require("node-id3");


/*

{
	"filename":{
		"artist":"artistName"
		"title:":"songTitle"
	}
}

*/

fs.readdir("./files", async function(err, files) {
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