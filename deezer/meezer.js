const spawn = require("child_process").spawn;
const https = require("https");
const homedir = require("os").homedir();

function DownloadTrack(deezerTrack) {
	const dlpromise = new Promise((resolve, reject) => {
		const deemix = spawn("deemix", [deezerTrack], { "cwd": homedir });
		let filename;
		setTimeout(() => {
			deemix.kill("SIGINT");
		}, 30_000);
		deemix.stdout.on("data", (data) => {
			data = data.toString();
			// console.log("data: "+ data);
			// eslint-disable-next-line no-useless-escape
			const findFileName = data.match(/\/(.*\.mp3)\n/);
			// console.log(findFileName);
			if (findFileName) {
				filename = findFileName[1];
			}
		});
		deemix.on("close", (code) => {
			console.log("deemix finished download with code " + code);
			if (code == 0) {
				// console.log(filename);
				resolve(homedir + "/music/" + filename);
			}
			else {
				reject(code);
			}
		});
	});
	return dlpromise;
}

function searchTrack(query) {
	const trackpromise = new Promise((resolve, reject) => {
		// we only get 1 result from the api
		https.get("https://api.deezer.com/search?index=0&limit=1&q=" + encodeURIComponent(query), (res) => {
			if (res.statusCode != 200) {
				reject("DZ Search Code " + res.statusCode);
			}
			res.on("data", (data) => {
				// parse data
				data = JSON.parse(data.toString());
				// if there is a first result
				if (data.data[0]) {
					// return it
					resolve(data.data[0]);
				}
				else {
					reject("DZ Search No Results");
				}
			});
		});
	});
	return trackpromise;
}


module.exports = { DownloadTrack, searchTrack };