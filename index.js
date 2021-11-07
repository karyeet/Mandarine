// load token into enviroment
require("dotenv").config();

const { Intents, Client } = require("discord.js");

// Intents: Guilds, VoiceStates, GuildMesssages
const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES];

// Create Client with discord commando
const client = new Client({ intents });


const DIY_COMMANDO = {
	"join": require("./commands/join.js"),
	"disconnect": require("./commands/disconnect.js"),
	"play": require("./commands/play.js"),
	"pause": require("./commands/pause.js"),
	"resume": require("./commands/unpause.js"),
	"unpause": require("./commands/unpause.js"),
	"skip": require("./commands/skip.js"),
};
DIY_COMMANDO["join"];

client.once("ready", () => {
	console.log("Ready!");
});

// Login
client.login(process.env.token);

function checkCommand(content) {
	if (!content[0] == ">") {
		return false;
	}
	const splitContent = content.slice(1).split(" ");

	const command = splitContent[0].toLowerCase();
	splitContent.shift();
	const args = splitContent.join(" ");

	return { command, args };
}

client.on("messageCreate", (msg) => {
	const { command, args } = checkCommand(msg.content);

	if (DIY_COMMANDO[command]) {
		DIY_COMMANDO[command](msg, args);
	}

});

module.exports = { client };