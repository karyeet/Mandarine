// load token into enviroment
require("dotenv").config();

const { Intents, Client } = require("discord.js");

// Intents: Guilds, VoiceStates, GuildMesssages
const intents = [Intents.FLAGS.GUILDS, Intents.GUILD_VOICE_STATES, Intents.GUILD_MESSAGES];

// Create Client with discord commando
const client = new Client({ intents });

const DIY_COMMANDO = {
	"join": require("./join.js"),
	"play": require("./play.js"),
	"pause": require("./pause.js"),
	"resume": require("./resume.js"),
};
DIY_COMMANDO["join"];

client.once("ready", () => {
	console.log("Ready!");
});

// Login
client.login(process.env.token);

function checkCommand(content) {
	const splitContent = content.slice(1).split(" ");

	const command = splitContent[0];
	splitContent.shift();
	const args = splitContent.join(" ");

	return { command, args };
}

client.on("messageCreate", (msg) => {
	const { command, args } = checkCommand(msg);

	if (DIY_COMMANDO[command]) {
		DIY_COMMANDO[command](args);
	}

});

exports = { client };