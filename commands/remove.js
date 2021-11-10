/*

remove item from queue


*/

const { reactions, queue } = require("../general.js");

function remove(message, args) {
	if (!(message.guild.me.voice.channelId) || !(message.member.voice.channelId == message.guild.me.voice.channelId)) {
		message.react(reactions.negative);
		return false;
	}
	// set index to remove to number(args)
	const indexToRemove = Number(args);
	// if args cannot be a number or does not exist, dont do anything
	if (isNaN(Number(args)) || !args) {
		message.react(reactions.confused);
		return false;
	}
	// if there is no queue or there is no item at the specified index, dont do anything
	if (!queue[message.guild.id] || !queue[message.guild.id][indexToRemove]) {
		message.react(reactions.negative);
		return false;
	}
	// remove item from array
	queue[message.guild.id].splice(indexToRemove, 1);
	message.react(reactions.positive);
	return true;


}

module.exports = remove;