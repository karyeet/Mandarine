const { voiceCommands } = require("../config.json");

/*
-1 off
0 ok
1 incorrect
*/

function correctVoiceConfig() {
	if (voiceCommands && voiceCommands.enabled) {
		if (voiceCommands.picoAccessKey && voiceCommands.porcupineFileName && voiceCommands.rhinoFileName) {
			return 0;
		}
		else {
			return 1;
		}
	}
	else {
		return -1;
	}
}

module.exports = correctVoiceConfig;