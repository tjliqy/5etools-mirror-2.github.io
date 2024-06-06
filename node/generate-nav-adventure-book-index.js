import * as fs from "fs";
import "../js/parser.js";
import "../js/utils.js";
import * as ut from "./util.js";

const _PROPS_TO_INDEX = [
	"name",
	"id",
	"source",
	"parentSource",
	"group",
	"level",
	"storyline",
	"published",
	"publishedOrder",
];

const _METAS = [
	{
		file: `./${DataUtil.data_dir()}/adventures.json`,
		prop: "adventure",
	},
	{
		file: `./${DataUtil.data_dir()}/books.json`,
		prop: "book",
	},
];

const out = _METAS.mergeMap(({file, prop}) => {
	return {[prop]: ut.readJson(file)[prop]
		.map(it => _PROPS_TO_INDEX.mergeMap(prop => {
			const sub = {[prop]: it[prop]};
			// Expand the parent source, as the navbar doesn't wait for load completion.
			//   (Although in this instance, it actually does, but this keeps the API sane.)
			if (prop === "parentSource" && it[prop]) sub.parentName = Parser.sourceJsonToFull(it[prop]);
			return sub;
		})),
	};
});

fs.writeFileSync("./${DataUtil.data_dir()}/generated/gendata-nav-adventure-book-index.json", JSON.stringify(out), "utf8");
console.log("Generated navbar adventure/book index.");
