const { Intents, Client } = require("discord.js");

const { reactions, guildsMeta } = require("./general.js");

// Intents: Guilds, VoiceStates, GuildMesssages
const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_PRESENCES];

// Create Client with discord commando
const client = new Client({ intents });

// table of command names and their corresponding files/functions
const DIY_COMMANDO = require("./diy_commando.js");

client.once("ready", () => {
	console.log("Ready in " + client.guilds.cache.size + " guild(s).");
	client.user.setActivity("Prefix: >", { type: "WATCHING" });
});

const config = require("./config.json");

// Login
console.log("runIndexer is set to " + config.runIndexerOnStart);
if (config.runIndexerOnStart == true) {
	require("./music/indexer.js").index().then(() => {
		client.login(config.token);
	});
}
else {
	client.login(config.token);
}

// check if prefix is ">", and if so return the command back
function checkCommand(content) {
	if (!(content[0] == ">")) {
		return false;
	}
	const splitContent = content.slice(1).split(" ");

	const command = splitContent[0].toLowerCase();
	splitContent.shift();
	const args = splitContent.join(" ");

	return { command, args };
}

client.on("messageCreate", (message) => {
	// check if the message is a command and parse args
	const { command, args } = checkCommand(message.content);

	// Check the command against the command table, and then run it
	// We pass the command arg to the command function for different functionalities, ex. if ">music" is used instead of ">play" we use soundcloud exclusively

	processCommand(command, args, message);

});

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	// console.log(interaction.commandName);
	// console.log(interaction.options.data);

	const command = interaction.commandName;
	const argsArray = [];

	for (const option of interaction.options.data) {
		argsArray.push(option.value);
	}
	// console.log(argsArray);
	const args = argsArray.join(" ");


	interaction.react = async (reaction) => {
		return interaction.editReply({ content: reaction, fetchReply: true, ephemeral: true });
	};
	await interaction.deferReply({ ephemeral: true, fetchReply: true });
	interaction.author = interaction.member.user;
	// console.log(interaction.member.displayName)
	// console.log(interaction.author)

	// follow up for addtoqueue message
	interaction.reply = (replyArgs) => {
		replyArgs.ephemeral = false;
		replyArgs.fetchReply = true;
		return interaction.followUp(replyArgs);
	};

	interaction.delete = interaction.deleteReply;

	processCommand(command, args, interaction);
});

function processCommand(command, args, message) {
	if (DIY_COMMANDO[command]) {
		try {
			DIY_COMMANDO[command](message, args, command);
			// terminate spotify following if any commands are ran
			if ((command != "queue" && command != "spotify") && guildsMeta[message.guild.id] && guildsMeta[message.guild.id].spotify) {
				guildsMeta[message.guild.id].spotify = false;
			}
		}
		catch (error) {
			message.react(reactions.warning);
			message.reply("```index.js: " + error + "```");
			console.log(error);
		}
	}
}

if (require("./voice/correctVoiceConfig")() == 0) {
	client.on("voiceStateUpdate", (oldState, newState) => {
		require("./voice/voiceProcessing").trackVCMembers(oldState, newState, client.id);
	});
}
