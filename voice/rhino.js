const { Rhino } = require("@picovoice/rhino-node");

const path = require("path");

const { picoAccessKey, rhinoFileName } = require("../config.json");
const accessKey = picoAccessKey;

const contextPath = path.join(path.join(__dirname, "models"), rhinoFileName);

// const rhino = new Rhino(accessKey, contextPath);

/*
intentDetectors = {channelid : rhino}
*/
// const intentDetectors = {};

function processRhinoVoiceData(PCMprovider) {
	return new Promise((resolve) => {
		const rhino = new Rhino(accessKey, contextPath, 0.2, undefined, false);
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