/*

one off script to perform fuse.js configuration tests

*/

const Fuse = require("fuse.js");
const localLibrary = require("./localLibrary.json");

const query = "metro suphero";

const fuse = new Fuse(Object.values(localLibrary),
	{
		"keys": ["search", "title"],
		includeScore: true,
		threshold: 0.4,
	});
// perform search

const fuseResult = fuse.search(query);
// if valid match, return filename
// console.log(fuseResult);
if (fuseResult[0]) {
	console.log("fuse found");
	console.log(fuseResult);
}