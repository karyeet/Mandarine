const DIY_COMMANDO = {

	"join": require("./commands/join.js"),

	"disconnect": require("./commands/disconnect.js"),
	"leave": require("./commands/disconnect.js"),

	"play": require("./commands/play.js"),
	"music": require("./commands/play.js"),

	"pause": require("./commands/pause.js"),
	"stop": require("./commands/pause.js"),

	"resume": require("./commands/unpause.js"),
	"unpause": require("./commands/unpause.js"),

	"skip": require("./commands/skip.js"),

	"queue": require("./commands/queue.js"),

	"remove": require("./commands/remove.js"),

	"loop": require("./commands/loop.js"),

	"spotify": require("./commands/spotify.js"),

};

module.exports = DIY_COMMANDO;