const { voiceCommands } = require("../config.json");

const { porcupineFileName, picoAccessKey } = voiceCommands;


const path = require("path");

const {
	Porcupine,
} = require("@picovoice/porcupine-node");

const userListeners = {};
const hotwordDetectors = {};

const keywordPath = path.join(path.join(__dirname, "models"), porcupineFileName);

/* const porcupine = new Porcupine(
	accessKey,
	[BuiltinKeyword.GRASSHOPPER, BuiltinKeyword.BUMBLEBEE],
	[0.5, 0.65],
);
*/

function emitHotword(hotword, userid, voiceChannel, emitter) {
	emitter.emit("hotword", {
		"hotword": hotword,
		"userid": userid,
		"voiceChannel": voiceChannel,
		"PCMprovider": emitter,
	});
}

// eventemitter providing frames to that should be provided to porcupine
function listenToPCM(PCMprovider, userid, voiceChannel) {

	// create function within scope of userid for easy use with event emitter
	function processVoiceData(audioFrame) {
		if (!hotwordDetectors[userid]) {
			hotwordDetectors[userid] = new Porcupine(
				picoAccessKey,
				[keywordPath],
				[0.5],
			);
		}
		const keywordIndex = hotwordDetectors[userid].process(audioFrame);
		if (keywordIndex === 0) {
			console.log("hotword");
			// emit when found, along with context payload
			emitHotword("hotword", userid, voiceChannel, PCMprovider);
			return "hotword";
		}
		return 0;
	}

	// if theres an old listener try to remove the event listener
	if (userListeners[userid]) {
		try {
			userListeners[userid].removeListener("frame", processVoiceData);
		}
		catch (err) {
			console.warn("[Error] while removing old listener for " + userid + "\n" + err);
		}
	}
	// set to new audio stream in table
	userListeners[userid] = PCMprovider;

	// on new data send to porcupine
	PCMprovider.on("frame", processVoiceData);

	// return PCMprovider
	return PCMprovider;
}

module.exports = { listenToPCM };