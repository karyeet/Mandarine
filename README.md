# Mandarine
A Node.js Discord music bot made using the latest versions of [Discord.js](https://github.com/discordjs/discord.js/) & [play-dl](https://github.com/play-dl/play-dl)

Mandarine was created as a personal Music Bot in lieu of Rythm Bot (RIP).

## Features:
- [x] Spotify Listen Along
- [x] Soundcloud streaming
- [x] Youtube streaming
- [x] Spotify & Deezer link support
- [x] play, pause, resume, skip, remove, queue
- [x] Detailed queue embed with buttons to increment pages
- [x] Other detailed embeds
- [x] Deletes its own messages to avoid clutter
- [x] Light weight & universal
- [x] Support deezer as a source
- [x] Local file support
- [x] Youtube playlist support

#### Planned Features:
- [ ] Spotify/Deezer Playlist support
- [ ] Help command
- [ ] Multi-threaded streaming
- [ ] Prefix command & other customizations
- [ ] Volume
- [ ] Preload next song for seamless playing

## Deployment
Before anything, install [Node v16 LTS](https://nodejs.org/en/) 
and [create a discord bot](https://discord.com/developers/applications)
then [add the bot to your server](https://help.pebblehost.com/en/article/how-to-invite-your-bot-to-a-discord-server-1asdlyg/).

In the discord developer dashboard, toggle on:
- PRESENCE INTENT
- SERVER MEMBERS INTENT
- MESSAGE CONTENT INTENT

then

1. Download the Zip Archive
2. Unzip archive to a directory of your choosing
3. Create a file called config.json in the directory and write `{token="yourBotToken"}` to the file
    1. Get your bot token from the discord developer dashboard
4. Open command prompt or terminal in the chosen directory
5. Run `npm install`
5. To start the bot run `node .` or `npm start`

To make use of the >music command, deemix must be installed via `python3 -m pip install deemix`

To automatically add local tagged mp3s to the localLibrary.json, add the files to the music folder (`$home$/mandarineFiles`) and run the indexer.js file found in `./music/indexer.js` using node.

### Check out the [wiki](https://github.com/karyeet/Mandarine/wiki) for commands and more help.
