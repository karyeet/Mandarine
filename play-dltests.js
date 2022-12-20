const pdl = require("play-dl");
const url = "https://www.youtube.com/watch?v=_AcodjYU8iw&list=OLAK5uy_krKYX3C-XqMNGIkJbyC0ibL_xq5qWmbq4";

async function test() {
	const type = await pdl.validate(url);
	console.log("type: " + type);
	const ytplaylist = await pdl.playlist_info(url, { incomplete : true });
	// const videos = await ytplaylist.all_videos();
	/* for (const i in videos) {
		const video = videos[i];
		console.log(video.title);
	}*/
	console.log(ytplaylist.icons);

}

test();