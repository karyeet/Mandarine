const { queueList, CalcQueuePages } = require("../presetEmbeds");
const { queue, reactions } = require("../general");

function queueFunc(message, args) {
	// if the queue doesnt exist or is empty, dont do anything
	if (!queue[message.guild.id] || queue[message.guild.id].length < 1) {
		message.react(reactions.negative);
		return false;
	}
	// if the page supplied by args is not a number, default page to 1
	let page = Number(args);
	if (isNaN(Number(page))) {
		page = 1;
	}
	// if the requested page is greater than the calculated max pages possible, set the page to the last page
	if (page > CalcQueuePages(queue[message.guild.id].length)) {
		page = CalcQueuePages(queue[message.guild.id].length);
	}


}

module.exports = queueFunc;