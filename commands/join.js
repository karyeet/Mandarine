/*

Check if already in a discord voicechannel in members guild -- not doing
voicechannel = voicestate

Check if member is in a voice channel

If so then join members current voice channel

*/

const { voiceCommands } = require("../config.json");

const { audioPlayers, queue, playNext, reactions, guildsMeta } = require("../general.js");

const {
	joinVoiceChannel,
	createAudioPlayer,
	NoSubscriberBehavior,
	AudioPlayerStatus } = require("@discordjs/voice");

// Checks if user who called upon the join command is in a voice channel. If not returns false otherwise joins channel
function join(message) {
	const voice = message.member.voice;

	// create queue for guild
	queue[message.guildId] = [];

	// guildMeta for information about guilds
	// volume is simply a placeholder for now
	guildsMeta[message.guildId] = {
		"looping": false,
		"volume": 1,
		"spotify": false,
	};

	// If user is not in channel if() returns false
	if (!voice.channelId) {
		message.reply("You are not in a voice chanel")
			.then((msg) => {
				setTimeout(() => {msg.delete();}, 10_000);
			});
		message.react(reactions.negative);
		return false;
	}
	/* if (message.channel.guild.me.voice.channelId) {
		message.reply("I am already in a voice channel!");
	}*/

	// Otherwise join users channel
	// if voiceCommands are enabled, selfDeaf is disabled
	const connection = joinVoiceChannel({
		channelId: voice.channelId,
		guildId: voice.channel.guildId,
		adapterCreator: voice.channel.guild.voiceAdapterCreator,
		selfDeaf: !voiceCommands.enabled,
	});
	// and create audioPlayer
	const audioPlayer = createAudioPlayer({
		behaviors: {
			noSubscriber: NoSubscriberBehavior.Pause,
		},
	});

	audioPlayer.on(AudioPlayerStatus.Idle, async () => {
		if (!guildsMeta[message.guildId].looping) {
			queue[message.guild.id].shift();
		}

		if (queue[message.guild.id] && queue[message.guild.id][0]) {
			playNext(message);
		}
		else {
			message.guild.me.setNickname(message.guild.me.user.username);
		}
	});

	// Add audio player to guild:audioplayer table
	audioPlayers[message.guildId] = audioPlayer;

	// voiceConnection will play from this audioPlayer
	connection.subscribe(audioPlayer);

	/* const audioStream = connection.receiver.subscribe("257438782654119937",
		{
			"autoDestroy":false,
			"objectMode": true,
		});
	require("../voice/keywordProcessing").listenToOpus(audioStream);
	*/

	// initalize voice commands
	try {
		// dont start if not enabled
		const start = require("../voice/correctVoiceConfig")();
		if (start == 0) {
			require("../voice/voiceProcessing").initializeVoiceCommands(message, connection);
		}
		else if (start == 1) {
			throw "voiceCommands.picoAccessKey, voiceCommands.porcupineFileName, or voiceCommands.rhinoFileName is not set correctly in config.json";
		}
	}
	catch (error) {
		console.warn("Error while processing or initializing voice commands: " + error);
		message.reply("```join.js: " + error + "```");
	}

	message.react(reactions.positive);
	return { connection, audioPlayer };

}

module.exports = join;