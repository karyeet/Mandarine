const { guildsMeta, reactions } = require("../general.js");

function loop(message) {
	if (!guildsMeta[message.guildId]) {
		return false;
	}

	if (guildsMeta[message.guildId].looping) {
		guildsMeta[message.guildId].looping = false;
		message.react(reactions.next_track);
	}
	else {
		guildsMeta[message.guildId].looping = true;
		message.react(reactions.repeat);
	}

	return true;
}

module.exports = loop;