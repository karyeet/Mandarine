/*

Communicate with a deemix-web server to download files

This file is available as an example if anyone decides to complete the
implementation or wants to use it in a personal project.

*/


// http://192.168.2.1:6595/api/search?term=metroboomin&type=track&start=0&nb=1

// http://192.168.2.1:6595/api/addToQueue
// payload
// {"url":"https://www.deezer.com/track/2047662477","bitrate":null}

// response all we care about
// {"result": true/false}


const { get, request } = require("http");
const { deemixHost, deemixPort } = require("../config.json");

function getSessionOptions(host, port) {
	return {
		"host": host,
		"port": port,
		"path": "/",
		"method": "HEAD",
	};
}

function getSession() {
	return new Promise((resolve, reject) => {
		const options = getSessionOptions(deemixHost, deemixPort);
		const req = request(options, function(res) {
			// console.log(res.headers["set-cookie"]);
			if (!res.headers || !res.headers["set-cookie"]) {
				reject("Couldn't get sessionID");
			}
			const sessionID = res.headers["set-cookie"][0].match(/(connect\.sid.*[A-Za-z0-9])(;)/)[1];
			// console.log(sessionID);
			resolve(sessionID);
		},
		);
		req.end();
	});
}

function connectOptions(host, port, sessionID) {
	return {
		"host": host,
		"port": port,
		"path": "/api/connect",
		"headers":{
			"Cookie": sessionID,
		},
	};
}

// to get arl
function connect(sessionID) {
	return new Promise((resolve, reject) => {
		const options = connectOptions(deemixHost, deemixPort, sessionID);

		get(options, (res) => {
			if (res.statusCode !== 200) {
				reject("Deemix returned " + res.statusCode);
			}

			res.setEncoding("utf8");

			let rawData = "";

			res.on("data", (chunk) => {
				rawData += chunk;
			});

			res.on("end", () => {
				const parsedData = JSON.parse(rawData);
				// console.log(parsedData);
				resolve(parsedData);
			});

		});
	});
}

function loginARLOptions(host, port, contentLength, sessionID) {
	return {
		"host": host,
		"port": port,
		"path": "/api/loginARL",
		"method": "POST",
		"headers":{
			"Content-Type": "application/json",
			"Content-Length": contentLength,
			"Cookie": sessionID,
		},
	};
}


function loginARL(arl, sessionID) {
	return new Promise((resolve, reject) => {
		const postData = JSON.stringify({ "arl":arl, "force":true, "child":0 });
		// console.log(postData);
		// console.log(postData.length);
		const options = loginARLOptions(deemixHost, deemixPort, postData.length, sessionID);
		// console.log(options);
		const req = request(options, (res) => {
			if (res.statusCode !== 200) {
				reject("Deemix returned " + res.statusCode);
			}

			res.setEncoding("utf8");

			let rawData = "";

			res.on("data", (chunk) => {
				rawData += chunk;
			});

			res.on("end", () => {
				const parsedData = JSON.parse(rawData);
				console.log(parsedData.status);
				resolve(parsedData.status);
			});
		});
		req.write(postData);
		req.end();

	});
}

function downloadTrackOptions(host, port, contentLength, sessionID) {
	// console.log(contentLength);
	return {
		"host": host,
		"port": port,
		"path": "/api/addToQueue",
		"method": "POST",
		"headers":{
			"Content-Type": "application/json",
			"Content-Length": contentLength,
			"Cookie": sessionID,
		},
	};
}

function downloadTrack(id, sessionID) {
	return new Promise((resolve, reject) => {
		const postData = JSON.stringify({ "url":"https://www.deezer.com/track/" + id, "bitrate":null });
		const options = downloadTrackOptions(deemixHost, deemixPort, postData.length, sessionID);

		const req = request(options, (res) => {
			if (res.statusCode !== 200) {
				reject("Deemix returned " + res.statusCode);
			}

			res.setEncoding("utf8");

			let rawData = "";

			res.on("data", (chunk) => {
				rawData += chunk;
			});

			res.on("end", () => {
				const parsedData = JSON.parse(rawData);
				// console.log(parsedData);
				resolve(parsedData);
			});
		});
		req.write(postData);
		req.end();

	});
}

function searchOptions(term, host, port) {
	console.log(term);
	return {
		"host": host,
		"port": port,
		"path": "/api/search?term=" + encodeURIComponent(term) + "&type=track&start=0&nb=1",
	};
}


function trackSearch(term) {
	return new Promise((resolve, reject) => {
		const options = searchOptions(term, deemixHost, deemixPort);
		console.log(options);
		get(options, (res) => {
			if (res.statusCode !== 200) {
				reject("Deemix returned " + res.statusCode);
			}

			res.setEncoding("utf8");

			let rawData = "";

			res.on("data", (chunk) => {
				rawData += chunk;
			});

			res.on("end", () => {
				const parsedData = JSON.parse(rawData);
				// console.log(parsedData);
				resolve(parsedData.data);
			});

		});
	});
}

async function loginAndValidateSession() {
	const sessionID = await getSession();
	const connectData = await connect(sessionID);
	const arl = connectData.singleUser.arl;
	// console.log(arl);
	const status = await loginARL(arl, sessionID);
	if (!status) {
		throw "Unable to login to deemix";
	}
	return sessionID;
	// status == 1 all good, status == false not good
}

exports = { trackSearch, downloadTrack, loginARL, connect, loginAndValidateSession, getSession };


async function test() {
	const sessionID = await loginAndValidateSession();
	const track = await trackSearch("superhero metro");
	if (track[0]) {
		downloadTrack();
	}
	else {
		console.log("could not find track");
	}
}

test();