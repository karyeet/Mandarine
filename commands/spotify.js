/*
follow what someone is listening to in spotify
this will override normal commands
we will call play which will handle joining, this will simply add the songs to queue and keep the queue exclusive

*/


const { queue, guildsMeta, reactions } = require("../general.js");
const join = require("./join.js");
const play = require("./play.js");
const skip = require("./skip.js");

// const templateSpotifyURL = "https://open.spotify.com/track/";
// https://open.spotify.com/track/1AzqpMy3yLYNITSOUrnL8i

function getTrack(activities) {
	const track = {};
	for (let i = 0; i < activities.length;i++) {
		if (activities[i].syncId) {
			track.name = activities[i].details;
			track.artist = activities[i].state;
			track.id = activities[i].syncId;
			return track;
		}

	}
	// return false if we dont find an id
	return false;
}

async function spotify(message, args) {

	if (args == "stop" || args == "end" || args == "false") {
		guildsMeta[message.guild.id].spotify = false;
		message.react(reactions.positive);
		return true;
	}
	// if we are already following someone in spotify
	else if (guildsMeta[message.guild.id] && guildsMeta[message.guild.id].spotify) {
		console.log("Already listening along.")
		message.react(reactions.negative);
		return false;
	}

	//console.log(message.options);
	//console.log(message.options.getMember("user"));


	if ( (message.options && message.options.getMember("user")) || (message.mentions && message.mentions.members && message.mentions.members.first())) {

		// look for spotify activity
		let targetMember 
		// interaction or message compatability
		if(message.options && message.options.getMember("user")){
			targetMember = message.options.getMember("user");
		}else{
			targetMember = message.mentions.members.first();
		}

		console.log(targetMember.presence);
		let spotifyTrack = getTrack(targetMember.presence.activities);
		if (!spotifyTrack) {
			// they are not listening to spotify
			console.log("Member not listening on spotify.")
			message.react(reactions.negative);
			return false;
		}
		// else
		console.log("reply listening along")
		const scapeGoatMessage = await message.reply("Listening along!");
		// join in case we haven't
		await join(message);
		// reset the queue
		skip(scapeGoatMessage);
		console.log("listening along");
		queue[message.guild.id] = [];
		const deezerPlay = await play(scapeGoatMessage, `${spotifyTrack.artist} - ${spotifyTrack.name}`, "music");
		if(!deezerPlay){
			// play youtube
			await play(scapeGoatMessage, `${spotifyTrack.artist} - ${spotifyTrack.name} lyrics`);
		}
		message.react(reactions.positive);
		guildsMeta[message.guild.id].spotify = targetMember.id;

		// if inactive spotify reaches 60 (seconds) checks, we will terminate
		let inactiveSpotify = 0;
		const checkSpotify = setInterval(async () => {
			if (guildsMeta[message.guild.id].spotify && inactiveSpotify < 60) {
				// refetch watched member
				const member = await message.guild.members.fetch(guildsMeta[message.guild.id].spotify);
				const newTrack = getTrack(member.presence.activities);
				// console.log(newTrack);
				// manage inactive spotify counter
				if (newTrack) {
					// if there is a song
					inactiveSpotify = 0;
					if (newTrack.id != spotifyTrack.id) {
						// if new song
						spotifyTrack = newTrack;
						// play
						console.log("playing new spotify song");
						const deezerPlay = await play(scapeGoatMessage, `${spotifyTrack.artist} - ${spotifyTrack.name}`, "music");
						if(!deezerPlay){
							// play youtube
							await play(scapeGoatMessage, `${spotifyTrack.artist} - ${spotifyTrack.name} lyrics`);
						}
						skip(scapeGoatMessage);
					}
				}
				else {
					// if no song
					inactiveSpotify++;
				}
			}
			else {
				// stop checking if queue mode is no longer spotify
				console.log("no longer listening along");
				guildsMeta[message.guild.id].spotify = false;
				clearInterval(checkSpotify);
				scapeGoatMessage.delete();
			}

		}, 1000);

	}
	else {
		// no member specified
		console.log("no member specified")
		message.react(reactions.negative);
		return false;
	}


	return true;
}

module.exports = spotify;