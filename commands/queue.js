const { queueGen, CalcQueuePages } = require("../presetEmbeds");
const { queue, reactions } = require("../general");
const { MessageActionRow, MessageButton } = require("discord.js");

function buttonGen(guildid, page) {
	const row = new MessageActionRow();
	// create next button
	const nextButton = new MessageButton();
	nextButton.setCustomId("next");
	nextButton.setLabel("Next");
	nextButton.setStyle("PRIMARY");

	// create back button
	const backButton = new MessageButton();
	backButton.setCustomId("back");
	backButton.setLabel("Back");
	backButton.setStyle("SECONDARY");

	// if on the first page disable back button
	if (page == 1) {
		backButton.setDisabled(true);
	}
	else if (page == CalcQueuePages(queue[guildid].length)) {
		// if on the last page disable next button
		nextButton.setDisabled(true);
	}

	row.addComponents([backButton, nextButton]);
	return row;
}

function pageCheck(guildid, page) {
	// if the requested page is greater than the calculated max pages possible, set the page to the last page
	if (page > CalcQueuePages(queue[guildid].length)) {
		page = CalcQueuePages(queue[guildid].length);
	}
	// if the requested page is less than 1, set the page to 1
	if (page < 1) {
		page = 1;
	}
	return page;
}

function queueFunc(message, args) {
	// if the queue doesnt exist or is empty, dont do anything
	if (!queue[message.guild.id] || queue[message.guild.id].length < 1) {
		message.react(reactions.negative);
		return false;
	}
	// if the page supplied by args is not a number, default page to 1

	let page = Number(args);
	if (isNaN(Number(page)) || !args) {
		page = 1;
	}

	page = pageCheck(message.guild.id, page);
	message.react(reactions.positive);
	
	// if there is more than one page create next and back button
	if (CalcQueuePages(queue[message.guild.id].length) > 1) {

		// message, auto delete after 60 seconds, and setup interaction responses
		message.reply({ components: [buttonGen(message.guild.id, page)], embeds:[queueGen(message.member.user, queue[message.guild.id], page)] })
			.then(msg => {
				// setTimeout(() => msg.delete(), 20000); not needed if we can delete message on interaction end
				const filter = (interaction) => interaction.customId == "next" || interaction.customId == "back";
				const collector = msg.createMessageComponentCollector({ filter, time: 30_000 });
				collector.on("collect", async (buttonInteraction) => {
					if (buttonInteraction.customId == "next") {
						// on next button press, increment page
						page += 1;
						// check page to make sure its not too high or low
						page = pageCheck(msg.guild.id, page);
						// edit the message with the new embed and buttons
						buttonInteraction.update({ components: [buttonGen(message.guild.id, page)], embeds:[queueGen(message.member.user, queue[message.guild.id], page)] });
					}
					else if (buttonInteraction.customId == "back") {
						// on next button press, increment page
						page -= 1;
						// check page to make sure its not too high or low
						page = pageCheck(msg.guild.id, page);
						// edit the message with the new embed and buttons
						buttonInteraction.update({ components: [buttonGen(message.guild.id, page)], embeds:[queueGen(message.member.user, queue[message.guild.id], page)] });
					}
				});

				collector.on("end", () => {
					msg.delete();
				});

			});


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