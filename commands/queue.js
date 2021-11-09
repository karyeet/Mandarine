const { queueGen, CalcQueuePages } = require("../presetEmbeds");
const { queue, reactions } = require("../general");
const { MessageActionRow, MessageButton } = require("discord.js");

function queueFunc(message, args) {
	// if the queue doesnt exist or is empty, dont do anything
	if (!queue[message.guild.id] || queue[message.guild.id].length < 1) {
		message.react(reactions.negative);
		return false;
	}
	// if the page supplied by args is not a number, default page to 1

	let page = Number(args);
	console.log(page);
	if (isNaN(Number(page)) || !args) {
		page = 1;
	}
	console.log(page);
	// if the requested page is greater than the calculated max pages possible, set the page to the last page
	if (page > CalcQueuePages(queue[message.guild.id].length)) {
		page = CalcQueuePages(queue[message.guild.id].length);
	}
	console.log(page);
	// if there is more than one page create next button
	if (CalcQueuePages(queue[message.guild.id].length) > 1) {

		const row = new MessageActionRow();
		const nextButton = new MessageButton();
		nextButton.setCustomId("next");
		nextButton.setLabel("Next");
		nextButton.setStyle("PRIMARY");

		// if on the first page do not add back button
		if (page == 1) {
			row.addComponents(nextButton);
			// message and auto delete after 60 seconds
			message.reply({ components: [row], embeds:[queueGen(message.member.user, queue[message.guild.id], page)] })
				.then(msg => {
					setTimeout(() => msg.delete(), 60000);
				});
		}
		else {
			// otherwise add back button
			const backButton = new MessageButton();
			backButton.setCustomId("back");
			backButton.setLabel("Back");
			backButton.setStyle("SECONDARY");
			row.addComponents([backButton, nextButton]);
			// message and auto delete after 60 seconds
			message.reply({ components: [row], embeds:[queueGen(message.member.user, queue[message.guild.id], page)] })
				.then(msg => {
					setTimeout(() => msg.delete(), 60000);
				});

		}

	}
	else {
		// otherwise send the queue without buttons and delete after 60 seconds
		message.reply({ embeds:[queueGen(message.member.user, queue[message.guild.id], page)] })
			.then(msg => {
				setTimeout(() => msg.delete(), 60000);
			});
	}

}

module.exports = queueFunc;