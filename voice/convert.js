const prism = require("prism-media");
const { EventEmitter } = require("events");

const outputEvents = {};

// 16 bits of noise
const PCMEndpointFrame = new Buffer.alloc(512, 0xFFFF);


/* const fs = require("fs");
const path = require("path");
const writeStream = fs.createWriteStream(path.join(__dirname, "257438782654119937.pcm"), { flags:"a" });
*/
// store orphaned frames (because need size of 512, but provided 640)
const userFrameAccumulators = {};


function chunkArray(array, size) {
	return Array.from({ length: Math.ceil(array.length / size) }, (v, index) =>
		array.slice(index * size, index * size + size),
	);
}

function processFrames(data, userid, frameLength) {
	if (userid == "257438782654119937") {
		// writeStream.write(Buffer.from(data));
	}
	// Two bytes per Int16 from the data buffer
	const newFrames16 = new Array(data.length / 2);
	for (let i = 0; i < data.length; i += 2) {
		newFrames16[i / 2] = data.readInt16LE(i);
	}

	// Split the incoming PCM integer data into arrays of size Porcupine.frameLength. If there's insufficient frames, or a remainder,
	// store it in 'frameAccumulator' for the next iteration, so that we don't miss any audio data
	userFrameAccumulators[userid] = userFrameAccumulators[userid].concat(newFrames16);
	const frames = chunkArray(userFrameAccumulators[userid], frameLength);

	if (frames[frames.length - 1].length !== frameLength) {
		// store remainder from divisions of frameLength
		userFrameAccumulators[userid] = frames.pop();
	}
	else {
		userFrameAccumulators[userid] = [];
	}
	// provide frames through event
	for (const frame of frames) {
		outputEvents[userid].emit("frame", frame);
	}

}


function processOpusStream(userid, stream, outputFrameLength) {

	userFrameAccumulators[userid] = [];

	outputEvents[userid] = new EventEmitter();

	const PCMStream = new prism.opus.Decoder({ frameSize: 640, channels: 1, rate: 16000 });
	/* stream.once("data", (data)=>{
		console.log("silent opus 620: " + JSON.stringify(data.toJSON()));
	});
	PCMStream.once("data", (data) => {
		console.log("silent pcm 620: " + JSON.stringify(data.toJSON()));
	});*/
	// pipe the opus stream to the decoder
	stream.pipe(PCMStream);

	const userVoiceFrames = [];
	PCMStream.on("data", (data) => {
		userVoiceFrames.push(data);
	});

	// only send maximum of 1 second of silence after an audio frame
	let silenceTimer = 0;
	const timeToGive = 1;
	// decrease silencetimer by 0.25sec every 125ms because interval runs at double 16khz, so this interval must run at half 250ms
	setInterval(() => {
		silenceTimer -= 0.25;
	}, 125);

	// run interval at 16khz
	setInterval(() => {
		// console.log("userVoiceFrames.length: " + userVoiceFrames.length);
		if (userVoiceFrames.length > 0) {
			// process voice if it exists
			const data = userVoiceFrames.shift();
			processFrames(data, userid, outputFrameLength);
			// set two seconds of silence
			silenceTimer = timeToGive;
		}
		else if (silenceTimer > 0) {
			// if silenceTimer, send silent frames
			const data = PCMEndpointFrame;
			processFrames(data, userid, outputFrameLength);
		}
	}, 1_000 / 32);

	return outputEvents[userid];
}

module.exports = { processOpusStream };

