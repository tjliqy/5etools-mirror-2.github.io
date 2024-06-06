import "../js/parser.js";
import "../js/utils.js";
import "../js/utils-dataloader.js";
import "../js/render.js";
import "../js/render-dice.js";
import * as ut from "./util.js";
import {setUp, loadSpells, run, teardown} from "./util-tag-jsons.js";

/**
 * Args:
 * file="./${DataUtil.data_dir()}/my-file.json"
 * filePrefix="./${DataUtil.data_dir()}/dir/"
 * inplace
 * bestiaryFile="./${DataUtil.data_dir()}/my-file.json"
 */
async function main () {
	ut.ArgParser.parse();
	setUp();
	await TagJsons.pInit({
		spells: loadSpells(),
	});
	run(ut.ArgParser.ARGS);
	teardown();
	console.log("Run complete.");
}

main();
