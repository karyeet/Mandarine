const { processOpusStream } = require("./convert");

const { listenToPCM } = require("./porcupine");

const { processRhinoVoiceData } = require("./rhino.js");

const { guildsMeta, reactions } = require("../general.js");

const { getVoiceConnection } = require("@discordjs/voice");

const DIY_COMMANDO = require("../diy_commando.js");

// const { voiceCommands } = require("../config.json");

/*
audioReceivers = {
	channelid:{
		userid:receiver
	}
}
*/
const audioReceivers = {};

/*
hotwordDebounce:{channelid:true}
*/
const hotwordDebounce = {};


async function hotwordDetected(context) {
	const { userid, voiceChannel, PCMprovider } = context;
	// set debounce for channel/guild
	if (hotwordDebounce[voiceChannel.id]) {
		return;
	}
	hotwordDebounce[voiceChannel.id] = true;
	// stop sending audio frames to porcupine
	PCMprovider.removeAllListeners("frame");
	// start sending to rhino & to an array in case rhino is inconclusive
	const voiceData = [];
	PCMprovider.on("frame", (frame) => {
		voiceData.push(frame);
	});
	const intentResult = await processRhinoVoiceData(PCMprovider);
	if (!intentResult) {
		console.log("unknown intent");
	}
	else {
		console.log(intentResult);
		DIY_COMMANDO[intentResult](guildsMeta[voiceChannel.guild.id].notifyRecording);
	}

	// resume listening for hotword
	console.log("resuming listening for hotword");
	listenToPCM(PCMprovider, userid, voiceChannel);
	// unset debounce
	hotwordDebounce[voiceChannel.id] = false;
}

// pass along voice channel for context when hotword is found
function listenToOpus(opusStream, userid, voiceChannel) {
	const picoPCMProvider = processOpusStream(userid, opusStream, 512);
	// listen for hotword event then start listening for hotwords,
	picoPCMProvider.on("hotword", hotwordDetected);
	return listenToPCM(picoPCMProvider, userid, voiceChannel);
}

function receiveMember(member, voiceConnection, voiceChannel) {
	// only if not bot
	if (!member.user.bot) {
		const audioreceiver = voiceConnection.receiver.subscribe(member.id,	{
			"autoDestroy": true,
			"objectMode": true,
		});
		audioReceivers[voiceChannel.id][member.id] = audioreceiver;
		return listenToOpus(audioreceiver, member.id, voiceChannel);
	}
}

async function initializeVoiceCommands(message, voiceConnection) {

	guildsMeta[message.guildId].notifyRecording = await message.channel.send(reactions.speaking + "Voice commands are enabled.");
	const voiceChannel = message.member.voice.channel;
	const members = voiceChannel.members;

	// initalize receiver table
	audioReceivers[voiceChannel.id] = {};

	// create receiver for each member currently in vc
	members.forEach((member) => {receiveMember(member, voiceConnection, voiceChannel);});

}

// should be executed by client eventemitter for voicestateupdate
async function trackVCMembers(oldState, newState, clientid) {
	if (audioReceivers[oldState.channelId] && (oldState.id == clientid && !newState.channel || oldState.channelId != newState.channelId)) {
		// i left the voice channel, destroy all listeners for channelid
		// console.log("I was disconnected from VC");
		for (const userid in audioReceivers[oldState.channelId]) {
			audioReceivers[oldState.channelId][userid].destroy();
		}
	}
	else if (oldState.channelId != newState.channelId) {
		// someone left or joined a voice channel, otherwise dont care
		if (audioReceivers[oldState.channelId] && (!newState.channel || oldState.channelId != newState.channelId)) {
			// someone left my voice channel
			// destroy audioreceiver if it exists
			if (audioReceivers[oldState.channelId][oldState.id]) {
				audioReceivers[oldState.channelId][oldState.id].destroy();
			}

		}
		else if (audioReceivers[newState.channelId] && oldState.channelId != newState.channelId) {
			// someone joined my voice channel
			if (!newState.member.user.bot) {
				// create new audioreceiver if they're not a bot and a voice connection exists
				const voiceConnection = await getVoiceConnection(newState.guild.id);
				if (voiceConnection) {
					receiveMember(newState.member, voiceConnection, newState.channel);
				}
			}
		}
	}
}


module.exports = { initializeVoiceCommands, listenToOpus, trackVCMembers };