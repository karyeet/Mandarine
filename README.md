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
- [x] Spotify playlist support
- [x] Partial support for voice commands
- [x] Help command
- [x] Docker image

#### Planned Features:

- [ ] Deezer Playlist support
- [ ] Multi-threaded streaming
- [ ] Prefix command & other customizations
- [ ] Volume
- [ ] Preload next song for seamless playing
- [ ] Voice recognition for play command

## Docker Deployment (Preferred)
[Create a discord bot](https://discord.com/developers/applications)
then [add the bot to your server](https://help.pebblehost.com/en/article/how-to-invite-your-bot-to-a-discord-server-1asdlyg/).

In the discord developer dashboard, toggle on:
- PRESENCE INTENT
- SERVER MEMBERS INTENT
- MESSAGE CONTENT INTENT

Example docker-compose.yml:

```
version: "3"

services:
  mandarine:
    container_name: mandarine_music_bot
    image: karyeet/mandarine:latest
    volumes:
      - ./config/config.json:/Mandarine/config.json:ro
      - ./config/models/:/Mandarine/voice/models:ro
      - ./mandarineFiles:/root/mandarineFiles
      - ./playdlData:/Mandarine/.data
    environment:
      - "arl=5a2e"
      - "runIndexer=True"
    restart: unless-stopped
```

Create a folder and create your docker-compose.yml inside it.
In the same folder create a folder called config, within this folder paste your config.json. An example config can be found in the repository.
If you want to use the picovoice backed voice commands, paste your models within a folder called models within the config folder.

To use >music, you must provide your deezer arl token to the environment. Replace "5a2e" with your full arl token in the docker-compose.yml file.

To authorize play-dl with spotify or youtube, run this command while inside the same folder as your docker-compose.yml. Specify that you would like to save to file:

`
sudo docker run -it --rm -v "./playdlData:/.data" karyeet/mandarine:latest /bin/ash -c "node /Mandarine/Docker/authorize.js"
`


## Normal Deployment
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
3. Create a file called config.json in the directory and copy the config example to the file, then configure as necessary. (token is required)
    1. Get your bot token from the discord developer dashboard
4. Open command prompt or terminal in the chosen directory
5. Run `npm install`
5. To start the bot run `node .` or `npm start`

To make use of the >music command, deemix must be installed via `python3 -m pip install deemix`

To support spotify links, play-dl must have spotify authorization. Check the wiki.

To automatically add local tagged mp3s to the localLibrary.json, add the files to the music folder (`$home$/mandarineFiles`) and run the indexer.js file found in `./music/indexer.js` using node.

### Check out the [wiki](https://github.com/karyeet/Mandarine/wiki) for commands and more help.
