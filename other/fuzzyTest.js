const localLibrary = require("../music/localLibrary.json");
const FuzzySet = require('fuzzyset')

function createFuzzySetArr(){
	const fzpromise = new Promise((resolve, reject)=>{
		const arr = [];
		for (const key in localLibrary){
			const searchTerm = localLibrary[key].search;
			arr.push(searchTerm)
		}
		resolve(arr);
	})
	return fzpromise;
}

async function test(){
    const fuzzyArr = await createFuzzySetArr();
    const fuzzySet = new FuzzySet(fuzzyArr);
    const fuzzyResult = fuzzySet.get("kanye west");

    if (fuzzyResult && fuzzyResult[0]) {
		console.log("fuzzy found");
		console.log(fuzzyResult);
		for (const index in fuzzyArr){
			if(fuzzyArr[index] == fuzzyResult[0][1]){
				const fuzzyfilepath = Object.keys(localLibrary)[index];
                console.log(fuzzyfilepath);
			}
		}

	}

}

test()