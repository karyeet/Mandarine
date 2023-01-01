const { voiceCommands } = require("../config.json");

// dont start if not enabled
if (!voiceCommands || !voiceCommands.enabled) {
	return false;
}
// if config is incorrect, throw error
if (!voiceCommands.picoAccessKey || !voiceCommands.porcupineFileName || !voiceCommands.rhinoFileName) {
	throw "rhino.js: picoAccessKey, porcupineFileName, or rhinoFileName is not set correctly.";
}

const { Rhino } = require("@picovoice/rhino-node");

const path = require("path");

const { picoAccessKey, rhinoFileName } = voiceCommands;

const contextPath = path.join(path.join(__dirname, "models"), rhinoFileName);

// const rhino = new Rhino(accessKey, contextPath);

/*
intentDetectors = {channelid : rhino}
*/
// const intentDetectors = {};

function processRhinoVoiceData(PCMprovider) {
	return new Promise((resolve) => {
		const rhino = new Rhino(picoAccessKey, contextPath, 0.5, 0.5, false);
		let isFinalized;
		PCMprovider.on("frame", function feedFrame(frame) {
			// if rhino already finalized dont run
			if (isFinalized) {
				return;
			}
			// feed frames until rhino makes it decision
			isFinalized = rhino.process(frame);
			// console.log("isfinalized " + isFinalized);
			if (isFinalized) {
				// rhino has decided, stop feeding
				PCMprovider.removeListener("frame", feedFrame);
				const inference = rhino.getInference();
				if (inference.isUnderstood) {
					const intent = inference.intent;
					// console.log("internal: " + intent);
					rhino.release();
					resolve(intent);
				}
				else {
					rhino.release();
					resolve(false);
				}
			}
		});
	});
}

module.exports = { processRhinoVoiceData };