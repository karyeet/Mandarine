const { helpGen } = require("../presetEmbeds");

function help(message) {
	message.reply({ embeds:[helpGen(message.author)] })
		.then(msg => {
			setTimeout(() => {
				msg.delete()
					.catch((err) => {console.log("[NONFATAL] Failed to delete message", err);});
			}, 30000);
		});
}
module.exports = help;