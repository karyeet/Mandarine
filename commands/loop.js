const { guildsLooping, reactions } = require("../general.js");

function loop(message) {
	if (guildsLooping[message.guildId]) {
		guildsLooping[message.guildId] = !guildsLooping[message.guildId];
		message.react(reactions.next_track);
	}
	else {
		guildsLooping[message.guildId] = !guildsLooping[message.guildId];
		message.react(reactions.repeat);
	}

}

module.exports = loop;