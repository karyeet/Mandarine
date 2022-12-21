const prism = require("prism-media");
const { EventEmitter } = require("events");

const outputEvents = {};

// store orphaned frames (because need size of 512, but provided 640)
const userFrameAccumulators = {};

// store frames before sending into outputstream
const userFrameStore = {};


function chunkArray(array, size) {
	return Array.from({ length: Math.ceil(array.length / size) }, (v, index) =>
		array.slice(index * size, index * size + size),
	);
}


function processOpusStream(userid, stream, outputFrameLength) {

	const frameLength = outputFrameLength;
	userFrameAccumulators[userid] = [];
	userFrameStore[userid] = [];

	outputEvents[userid] = new EventEmitter();

	const PCMStream = new prism.opus.Decoder({ frameSize: 640, channels: 1, rate: 16000 });
	// pipe the opus stream to the decoder
	stream.pipe(PCMStream);

	PCMStream.on("data", (data) => {
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
		// push frames to new readablestream
		for (const frame of frames) {
			outputEvents[userid].emit("frame", frame);
		}
	});
	return outputEvents[userid];
}

module.exports = { processOpusStream };

