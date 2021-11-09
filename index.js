// load token into enviroment
require("dotenv").config();

const { Intents, Client } = require("discord.js");

// Intents: Guilds, VoiceStates, GuildMesssages
const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS];

// Create Client with discord commando
const client = new Client({ intents });

// table of command names and their corresponding files/functions
const DIY_COMMANDO = {
	"join": require("./commands/join.js"),

	"disconnect": require("./commands/disconnect.js"),
	"leave": require("./commands/disconnect.js"),

	"play": require("./commands/play.js"),
	"music": require("./commands/play.js"),

	"pause": require("./commands/pause.js"),

	"resume": require("./commands/unpause.js"),
	"unpause": require("./commands/unpause.js"),

	"skip": require("./commands/skip.js"),

	"queue": require("./commands/queue.js"),

	"remove": require("./commands/remove.js"),

};

client.once("ready", () => {
	console.log("Ready!");
	client.user.setActivity("Prefix: >", { type: "WATCHING" });
});

// Login
client.login(process.env.token);

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

client.on("messageCreate", (msg) => {
	// check if the message is a command and parse args
	const { command, args } = checkCommand(msg.content);

	// Check the command against the command table, and then run it
	// We pass the command arg to the command function for different functionalities, ex. if ">music" is used instead of ">play" we use soundcloud exclusively
	if (DIY_COMMANDO[command]) {
		DIY_COMMANDO[command](msg, args, command);
	}

});