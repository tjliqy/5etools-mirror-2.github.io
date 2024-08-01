import fs from "fs";
import "../js/parser.js";
import * as utB from "./util-book-reference.js";

fs.writeFileSync("./data/generated/bookref-quick.json", JSON.stringify(utB.UtilBookReference.getIndex({name: "快速参考", id: "bookref-quick", tag: "quickref"})).replace(/\s*\u2014\s*?/g, "\\u2014"), "utf8");
console.log("Updated quick references.");
