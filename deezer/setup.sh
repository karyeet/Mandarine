#!/bin/bash

#node:16 docker container

#load env
if [ ! -f ../.env ]
then
  export $(cat ../.env | xargs)
fi

apt update

apt install -y python3-pip

python3 -m pip install deemix

mkdir ~/config

cat <<ENDOFCONFIG >> ~/config/config.json
{
	"downloadLocation": "music",
	"tracknameTemplate": "%artist% - %title%",
	"albumTracknameTemplate": "%tracknumber% - %title%",
	"playlistTracknameTemplate": "%position% - %artist% - %title%",
	"createPlaylistFolder": true,
	"playlistNameTemplate": "%playlist%",
	"createArtistFolder": false,
	"artistNameTemplate": "%artist%",
	"createAlbumFolder": true,
	"albumNameTemplate": "%artist% - %album%",
	"createCDFolder": true,
	"createStructurePlaylist": false,
	"createSingleFolder": false,
	"padTracks": true,
	"paddingSize": "0",
	"illegalCharacterReplacer": "_",
	"queueConcurrency": 3,
	"maxBitrate": "1",
	"feelingLucky": false,
	"fallbackBitrate": true,
	"fallbackSearch": false,
	"fallbackISRC": false,
	"logErrors": false,
	"logSearched": false,
	"overwriteFile": "n",
	"createM3U8File": false,
	"playlistFilenameTemplate": "playlist",
	"syncedLyrics": false,
	"embeddedArtworkSize": 800,
	"embeddedArtworkPNG": false,
	"localArtworkSize": 1400,
	"localArtworkFormat": "jpg",
	"saveArtwork": false,
	"coverImageTemplate": "cover",
	"saveArtworkArtist": false,
	"artistImageTemplate": "folder",
	"jpegImageQuality": 90,
	"dateFormat": "Y-M-D",
	"albumVariousArtists": true,
	"removeAlbumVersion": false,
	"removeDuplicateArtists": true,
	"featuredToTitle": "0",
	"titleCasing": "nothing",
	"artistCasing": "nothing",
	"executeCommand": "",
	"tags": {
	  "title": true,
	  "artist": true,
	  "artists": true,
	  "album": true,
	  "cover": true,
	  "trackNumber": true,
	  "trackTotal": false,
	  "discNumber": true,
	  "discTotal": false,
	  "albumArtist": true,
	  "genre": true,
	  "year": true,
	  "date": true,
	  "explicit": false,
	  "isrc": true,
	  "length": true,
	  "barcode": true,
	  "bpm": true,
	  "replayGain": false,
	  "label": true,
	  "lyrics": false,
	  "syncedLyrics": false,
	  "copyright": false,
	  "composer": false,
	  "involvedPeople": false,
	  "source": false,
	  "rating": false,
	  "savePlaylistAsCompilation": false,
	  "useNullSeparator": false,
	  "saveID3v1": true,
	  "multiArtistSeparator": "default",
	  "singleAlbumArtist": false,
	  "coverDescriptionUTF8": false
	}
  }
ENDOFCONFIG

echo $arl > ~/config/.arl
