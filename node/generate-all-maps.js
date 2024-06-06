import * as fs from "fs";
import * as ut from "./util.js";

import "../js/parser.js";
import "../js/utils.js";
import "../js/maps-util.js";

const out = {};

console.log("Updating maps...");

[
	{
		prop: "adventure",
		index: `./${DataUtil.data_dir()}/adventures.json`,
		dir: `./${DataUtil.data_dir()}/adventure`,
	},
	{
		prop: "book",
		index: `./${DataUtil.data_dir()}/books.json`,
		dir: `./${DataUtil.data_dir()}/book`,
	},
].forEach(({prop, index, dir}) => {
	ut.readJson(index)[prop].forEach(head => {
		console.log(`\tGenerating map data for ${head.id}`);
		const body = ut.readJson(`${dir}/${prop}-${head.id.toLowerCase()}.json`).data;
		const imageData = MapsUtil.getImageData({prop, head, body});
		if (imageData) Object.assign(out, imageData);
	});
});

fs.writeFileSync("./${DataUtil.data_dir()}/generated/gendata-maps.json", JSON.stringify(out), "utf8");
console.log("Updated maps.");
