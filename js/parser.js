"use strict";

// PARSING =============================================================================================================
globalThis.Parser = {};

Parser._parse_aToB = function (abMap, a, fallback) {
	if (a === undefined || a === null) throw new TypeError("undefined or null object passed to parser");
	if (typeof a === "string") a = a.trim();
	if (abMap[a] !== undefined) return abMap[a];
	return fallback !== undefined ? fallback : a;
};

Parser._parse_bToA = function (abMap, b, fallback) {
	if (b === undefined || b === null) throw new TypeError("undefined or null object passed to parser");
	if (typeof b === "string") b = b.trim();
	for (const v in abMap) {
		if (!abMap.hasOwnProperty(v)) continue;
		if (abMap[v] === b) return v;
	}
	return fallback !== undefined ? fallback : b;
};

Parser.attrChooseToFull = function (attList) {
	if (attList.length === 1) return `${Parser.attAbvToFull(attList[0])} 调整值`;
	else {
		const attsTemp = [];
		for (let i = 0; i < attList.length; ++i) {
			attsTemp.push(Parser.attAbvToFull(attList[i]));
		}
		return `${attsTemp.join(" 或 ")} 调整值（由你决定）`;
	}
};

Parser.numberToText = function (number) {
	if (number == null) throw new TypeError(`undefined or null object passed to parser`);
	if (Math.abs(number) >= 100) return `${number}`;

	return `${number < 0 ? "negative " : ""}${Parser.numberToText._getPositiveNumberAsText(Math.abs(number))}`;
};

Parser.numberToText._getPositiveNumberAsText = num => {
	const [preDotRaw, postDotRaw] = `${num}`.split(".");

	if (!postDotRaw) return Parser.numberToText._getPositiveIntegerAsText(num);

	let preDot = preDotRaw === "0" ? "" : `${Parser.numberToText._getPositiveIntegerAsText(Math.trunc(num))} 和 `;

	// See also: `Parser.numberToVulgar`
	switch (postDotRaw) {
		case "125": return `${preDot}one-eighth`;
		case "2": return `${preDot}one-fifth`;
		case "25": return `${preDot}one-quarter`;
		case "375": return `${preDot}three-eighths`;
		case "4": return `${preDot}two-fifths`;
		case "5": return `${preDot}one-half`;
		case "6": return `${preDot}three-fifths`;
		case "625": return `${preDot}five-eighths`;
		case "75": return `${preDot}three-quarters`;
		case "8": return `${preDot}four-fifths`;
		case "875": return `${preDot}seven-eighths`;

		default: {
			// Handle recursive
			const asNum = Number(`0.${postDotRaw}`);

			if (asNum.toFixed(2) === (1 / 3).toFixed(2)) return `${preDot}one-third`;
			if (asNum.toFixed(2) === (2 / 3).toFixed(2)) return `${preDot}two-thirds`;

			if (asNum.toFixed(2) === (1 / 6).toFixed(2)) return `${preDot}one-sixth`;
			if (asNum.toFixed(2) === (5 / 6).toFixed(2)) return `${preDot}five-sixths`;
		}
	}
};

Parser.numberToText._getPositiveIntegerAsText = num => {
	switch (num) {
		case 0: return "零";
		case 1: return "一";
		case 2: return "二";
		case 3: return "三";
		case 4: return "四";
		case 5: return "五";
		case 6: return "六";
		case 7: return "七";
		case 8: return "八";
		case 9: return "九";
		case 10: return "十";
		case 11: return "十一";
		case 12: return "十二";
		case 13: return "十三";
		case 14: return "十四";
		case 15: return "十五";
		case 16: return "十六";
		case 17: return "十七";
		case 18: return "十八";
		case 19: return "十九";
		case 20: return "二十";
		case 30: return "三十";
		case 40: return "四十";
		case 50: return "五十";
		case 60: return "六十";
		case 70: return "七十";
		case 80: return "八十";
		case 90: return "九十";
		default: {
			const str = String(num);
			return `${Parser.numberToText._getPositiveIntegerAsText(Number(`${str[0]}0`))}${Parser.numberToText._getPositiveIntegerAsText(Number(str[1]))}`;
		}
	}
};

Parser.textToNumber = function (str) {
	str = str.trim().toLowerCase();
	if (!isNaN(str)) return Number(str);
	switch (str) {
		case "zero": return 0;
		case "one": case "a": case "an": return 1;
		case "two": case "double": return 2;
		case "three": case "triple": return 3;
		case "four": case "quadruple": return 4;
		case "five": return 5;
		case "six": return 6;
		case "seven": return 7;
		case "eight": return 8;
		case "nine": return 9;
		case "ten": return 10;
		case "eleven": return 11;
		case "twelve": return 12;
		case "thirteen": return 13;
		case "fourteen": return 14;
		case "fifteen": return 15;
		case "sixteen": return 16;
		case "seventeen": return 17;
		case "eighteen": return 18;
		case "nineteen": return 19;
		case "twenty": return 20;
		case "thirty": return 30;
		case "forty": return 40;
		case "fifty": return 50;
		case "sixty": return 60;
		case "seventy": return 70;
		case "eighty": return 80;
		case "ninety": return 90;
	}
	return NaN;
};

Parser.numberToVulgar = function (number, { isFallbackOnFractional = true } = {}) {
	const isNeg = number < 0;
	const spl = `${number}`.replace(/^-/, "").split(".");
	if (spl.length === 1) return number;

	let preDot = spl[0] === "0" ? "" : spl[0];
	if (isNeg) preDot = `-${preDot}`;

	// See also: `Parser.numberToText._getPositiveNumberAsText`
	switch (spl[1]) {
		case "125": return `${preDot}⅛`;
		case "2": return `${preDot}⅕`;
		case "25": return `${preDot}¼`;
		case "375": return `${preDot}⅜`;
		case "4": return `${preDot}⅖`;
		case "5": return `${preDot}½`;
		case "6": return `${preDot}⅗`;
		case "625": return `${preDot}⅝`;
		case "75": return `${preDot}¾`;
		case "8": return `${preDot}⅘`;
		case "875": return `${preDot}⅞`;

		default: {
			// Handle recursive
			const asNum = Number(`0.${spl[1]}`);

			if (asNum.toFixed(2) === (1 / 3).toFixed(2)) return `${preDot}⅓`;
			if (asNum.toFixed(2) === (2 / 3).toFixed(2)) return `${preDot}⅔`;

			if (asNum.toFixed(2) === (1 / 6).toFixed(2)) return `${preDot}⅙`;
			if (asNum.toFixed(2) === (5 / 6).toFixed(2)) return `${preDot}⅚`;
		}
	}

	return isFallbackOnFractional ? Parser.numberToFractional(number) : null;
};

Parser.vulgarToNumber = function (str) {
	const [, leading = "0", vulgar = ""] = /^(\d+)?([⅛¼⅜½⅝¾⅞⅓⅔⅙⅚])?$/.exec(str) || [];
	let out = Number(leading);
	switch (vulgar) {
		case "⅛": out += 0.125; break;
		case "¼": out += 0.25; break;
		case "⅜": out += 0.375; break;
		case "½": out += 0.5; break;
		case "⅝": out += 0.625; break;
		case "¾": out += 0.75; break;
		case "⅞": out += 0.875; break;
		case "⅓": out += 1 / 3; break;
		case "⅔": out += 2 / 3; break;
		case "⅙": out += 1 / 6; break;
		case "⅚": out += 5 / 6; break;
		case "": break;
		default: throw new Error(`Unhandled vulgar part "${vulgar}"`);
	}
	return out;
};

Parser.numberToSuperscript = function (number) {
	return `${number}`.split("").map(c => isNaN(c) ? c : Parser._NUMBERS_SUPERSCRIPT[Number(c)]).join("");
};
Parser._NUMBERS_SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";

Parser.numberToSubscript = function (number) {
	return `${number}`.split("").map(c => isNaN(c) ? c : Parser._NUMBERS_SUBSCRIPT[Number(c)]).join("");
};
Parser._NUMBERS_SUBSCRIPT = "₀₁₂₃₄₅₆₇₈₉";

Parser._greatestCommonDivisor = function (a, b) {
	if (b < Number.EPSILON) return a;
	return Parser._greatestCommonDivisor(b, Math.floor(a % b));
};
Parser.numberToFractional = function (number) {
	const len = number.toString().length - 2;
	let denominator = 10 ** len;
	let numerator = number * denominator;
	const divisor = Parser._greatestCommonDivisor(numerator, denominator);
	numerator = Math.floor(numerator / divisor);
	denominator = Math.floor(denominator / divisor);

	return denominator === 1 ? String(numerator) : `${Math.floor(numerator)}/${Math.floor(denominator)}`;
};

Parser.ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

Parser.attAbvToFull = function (abv) {
	return Parser._parse_aToB(Parser.ATB_ABV_TO_FULL, abv);
};

Parser.attFullToAbv = function (full) {
	return Parser._parse_bToA(Parser.ATB_ABV_TO_FULL, full);
};

Parser.sizeAbvToFull = function (abv) {
	return Parser._parse_aToB(Parser.SIZE_ABV_TO_FULL, abv);
};

Parser.getAbilityModNumber = function (abilityScore) {
	return Math.floor((abilityScore - 10) / 2);
};

Parser.getAbilityModifier = function (abilityScore) {
	let modifier = Parser.getAbilityModNumber(abilityScore);
	if (modifier >= 0) modifier = `+${modifier}`;
	return `${modifier}`;
};

Parser.getSpeedString = (ent, {isMetric = false, isSkipZeroWalk = false, isLongForm = false, styleHint = null} = {}) => {
	if (ent.speed == null) return "\u2014";

	styleHint ||= VetoolsConfig.get("styleSwitcher", "style");

	const unit = isMetric
		? Parser.metric.getMetricUnit({originalUnit: "ft.", isShortForm: !isLongForm})
		: isLongForm ? "尺" : "尺";
	if (typeof ent.speed === "object") {
		const stack = [];
		let joiner = ", ";

		Parser.SPEED_MODES
			.filter(mode => !ent.speed.hidden?.includes(mode))
			.forEach(mode => Parser._getSpeedString_addSpeedMode({ent, prop: mode, stack, isMetric, isSkipZeroWalk, unit, styleHint}));

		if (ent.speed.choose && !ent.speed.hidden?.includes("choose")) {
			joiner = "; ";
			stack.push(`${ent.speed.choose.from.sort().joinConjunct(", ", " 或 ")} ${ent.speed.choose.amount} ${unit}${ent.speed.choose.note ? ` ${ent.speed.choose.note}` : ""}`);
		}

		return stack.join(joiner) + (ent.speed.note ? ` ${ent.speed.note}` : "");
	}

	return (isMetric ? Parser.metric.getMetricNumber({originalValue: ent.speed, originalUnit: Parser.UNT_FEET}) : ent.speed)
		+ (ent.speed === "Varies" ? "" : ` ${unit} `);
};
Parser._getSpeedString_addSpeedMode = ({ent, prop, stack, isMetric, isSkipZeroWalk, unit, styleHint}) => {
	if (ent.speed[prop] || (!isSkipZeroWalk && prop === "walk")) Parser._getSpeedString_addSpeed({prop, speed: ent.speed[prop] || 0, isMetric, unit, stack, styleHint});
	if (ent.speed.alternate && ent.speed.alternate[prop]) ent.speed.alternate[prop].forEach(speed => Parser._getSpeedString_addSpeed({prop, speed, isMetric, unit, stack, styleHint}));
};

Parser.SPEED_TO_CN = {
	"climb": "攀爬",
	"fly": "飞行",
	"hover": "悬浮",
	"swim": "游泳",
	"walk": "步行",
	"burrow": "掘穴"
}
Parser._getSpeedString_addSpeed = ({prop, speed, isMetric, unit, stack, styleHint}) => {
	const ptName = prop === "walk" ? "" : `${Parser.SPEED_TO_CN[prop] || (styleHint === "classic" ? prop.toString() : prop.toTitleCase())} `;
	const ptValue = Parser._getSpeedString_getVal({prop, speed, isMetric});
	const ptUnit = speed === true ? "" : ` ${unit}`;
	const ptCondition = Parser._getSpeedString_getCondition({speed});
	stack.push([ptName, ptValue, ptUnit, ptCondition].join(""));
};
Parser._getSpeedString_getVal = ({prop, speed, isMetric}) => {
	if (speed === true && prop !== "walk") return "与你的步行速度相同";

	const num = speed === true
		? 0
		: speed.number != null ? speed.number : speed;

	return isMetric ? Parser.metric.getMetricNumber({originalValue: num, originalUnit: Parser.UNT_FEET}) : num;
};
Parser._getSpeedString_getCondition = ({speed}) => speed.condition ? ` ${Renderer.get().render(speed.condition)}` : "";

Parser.SPEED_MODES = ["walk", "burrow", "climb", "fly", "swim"];

Parser.SPEED_TO_PROGRESSIVE = {
	"walk": "walking",
	"burrow": "burrowing",
	"climb": "climbing",
	"fly": "flying",
	"swim": "swimming",
};

Parser.speedToProgressive = function (prop) {
	return Parser._parse_aToB(Parser.SPEED_TO_PROGRESSIVE, prop);
};

Parser.raceCreatureTypesToFull = function (creatureTypes) {
	const hasSubOptions = creatureTypes.some(it => it.choose);
	return creatureTypes
		.map(it => {
			if (!it.choose) return Parser.monTypeToFullObj(it).asText;
			return [...it.choose]
				.sort(SortUtil.ascSortLower)
				.map(sub => Parser.monTypeToFullObj(sub).asText)
				.joinConjunct(", ", " or ");
		})
		.joinConjunct(hasSubOptions ? "; " : ", ", " 和 ");
};

Parser.crToXp = function (cr, {isDouble = false} = {}) {
	if (cr != null && cr.xp) return (isDouble ? cr.xp * 2 : cr.xp).toLocaleString();

	const toConvert = cr ? (cr.cr || cr) : null;
	if (toConvert === "Unknown" || toConvert == null || !Parser.XP_CHART_ALT[toConvert]) return "Unknown";
	// CR 0 creatures can be 0 or 10 XP, but 10 XP is used in almost every case.
	//   Exceptions, such as MM's Frog and Sea Horse, have their XP set to 0 on the creature
	if (toConvert === "0") return "10";
	const xp = Parser.XP_CHART_ALT[toConvert];
	return (isDouble ? 2 * xp : xp).toLocaleString();
};

Parser.crToXpNumber = function (cr) {
	if (cr != null && cr.xp) return cr.xp;
	const toConvert = cr ? (cr.cr || cr) : cr;
	if (toConvert === "Unknown" || toConvert == null) return null;
	return Parser.XP_CHART_ALT[toConvert] ?? null;
};

Parser.LEVEL_TO_XP_EASY = [0, 25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800];
Parser.LEVEL_TO_XP_MEDIUM = [0, 50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 3900, 4100, 4900, 5700];
Parser.LEVEL_TO_XP_HARD = [0, 75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 5900, 6300, 7300, 8500];
Parser.LEVEL_TO_XP_DEADLY = [0, 100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 8800, 9500, 10900, 12700];
Parser.LEVEL_TO_XP_DAILY = [0, 300, 600, 1200, 1700, 3500, 4000, 5000, 6000, 7500, 9000, 10500, 11500, 13500, 15000, 18000, 20000, 25000, 27000, 30000, 40000];

Parser.LEVEL_XP_REQUIRED = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

Parser.CRS = ["0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];

Parser.levelToXpThreshold = function (level) {
	return [Parser.LEVEL_TO_XP_EASY[level], Parser.LEVEL_TO_XP_MEDIUM[level], Parser.LEVEL_TO_XP_HARD[level], Parser.LEVEL_TO_XP_DEADLY[level]];
};

Parser.isValidCr = function (cr) {
	return Parser.CRS.includes(cr);
};

Parser.crToNumber = function (cr, opts = {}) {
	const { isDefaultNull = false } = opts;

	if (cr === "Unknown" || cr === "\u2014" || cr == null) return isDefaultNull ? null : VeCt.CR_UNKNOWN;
	if (cr.cr) return Parser.crToNumber(cr.cr, opts);

	const parts = cr.trim().split("/");
	if (!parts.length || parts.length >= 3) return isDefaultNull ? null : VeCt.CR_CUSTOM;
	if (isNaN(parts[0])) return isDefaultNull ? null : VeCt.CR_CUSTOM;

	if (parts.length === 2) {
		if (isNaN(Number(parts[1]))) return isDefaultNull ? null : VeCt.CR_CUSTOM;
		return Number(parts[0]) / Number(parts[1]);
	}

	return Number(parts[0]);
};

Parser.numberToCr = function (number, safe) {
	// avoid dying if already-converted number is passed in
	if (safe && typeof number === "string" && Parser.CRS.includes(number)) return number;

	if (number == null) return "Unknown";

	return Parser.numberToFractional(number);
};

Parser.crToPb = function (cr) {
	if (cr === "Unknown" || cr == null) return 0;
	cr = cr.cr || cr;
	if (Parser.crToNumber(cr) < 5) return 2;
	return Math.ceil(cr / 4) + 1;
};

Parser.levelToPb = function (level) {
	if (!level) return 2;
	return Math.ceil(level / 4) + 1;
};

Parser.SKILL_TO_ATB_ABV = {
	"运动": "str",
	"体操": "dex",
	"巧手": "dex",
	"隐匿": "dex",
	"奥秘": "int",
	"历史": "int",
	"调查": "int",
	"自然": "int",
	"宗教": "int",
	"驯兽": "wis",
	"洞悉": "wis",
	"医疗": "wis",
	"察觉": "wis",
	"生存": "wis",
	"欺瞒": "cha",
	"威吓": "cha",
	"表演": "cha",
	"说服": "cha",
};

Parser.skillToAbilityAbv = function (skill) {
	return Parser._parse_aToB(Parser.SKILL_TO_ATB_ABV, skill);
};

Parser.SKILL_TO_CN = {
	"athletics": "运动",
	"acrobatics": "特技",
	"sleight of hand": "巧手",
	"stealth": "隐匿",
	"arcana": "奥秘",
	"history": "历史",
	"investigation": "调查",
	"nature": "自然",
	"religion": "宗教",
	"animal handling": "驯兽",
	"insight": "洞悉",
	"medicine": "医疗",
	"perception": "察觉",
	"survival": "生存",
	"deception": "欺瞒",
	"intimidation": "威吓",
	"performance": "表演",
	"persuasion": "游说",
};

Parser.SKILL_TO_SHORT = {
	"athletics": "ath",
	"acrobatics": "acro",
	"sleight of hand": "soh",
	"stealth": "slth",
	"arcana": "arc",
	"history": "hist",
	"investigation": "invn",
	"nature": "natr",
	"religion": "reli",
	"animal handling": "hndl",
	"insight": "ins",
	"medicine": "med",
	"perception": "perp",
	"survival": "surv",
	"deception": "decp",
	"intimidation": "intm",
	"performance": "perf",
	"persuasion": "pers",
};

Parser.skillToShort = function (skill) {
	return Parser._parse_aToB(Parser.SKILL_TO_SHORT, skill);
};

Parser.LANGUAGES_STANDARD = [
	"Common",
	"Dwarvish",
	"Elvish",
	"Giant",
	"Gnomish",
	"Goblin",
	"Halfling",
	"Orc",
];

Parser.LANGUAGES_EXOTIC = [
	"Abyssal",
	"Aquan",
	"Auran",
	"Celestial",
	"Draconic",
	"Deep Speech",
	"Ignan",
	"Infernal",
	"Primordial",
	"Sylvan",
	"Terran",
	"Undercommon",
];

Parser.LANGUAGES_SECRET = [
	"Druidic",
	"Thieves' cant",
];

Parser.LANGUAGES_ALL = [
	...Parser.LANGUAGES_STANDARD,
	...Parser.LANGUAGES_EXOTIC,
	...Parser.LANGUAGES_SECRET,
].sort();

Parser.acToFull = function (ac, {renderer = null, isHideFrom = false} = {}) {
	if (typeof ac === "string") return ac; // handle classic format

	renderer ||= Renderer.get();

	let stack = "";
	let inBraces = false;
	for (let i = 0; i < ac.length; ++i) {
		const cur = ac[i];
		const nxt = ac[i + 1];

		if (cur.special != null) {
			if (inBraces) inBraces = false;

			stack += cur.special;
		} else if (cur.ac) {
			const isNxtBraces = nxt && nxt.braces;

			if (!inBraces && cur.braces) {
				stack += "(";
				inBraces = true;
			}

			stack += cur.ac;

			if (!isHideFrom && cur.from) {
				// always brace nested braces
				if (cur.braces) {
					stack += " (";
				} else {
					stack += inBraces ? "; " : " (";
				}

				inBraces = true;

				stack += cur.from.map(it => renderer.render(it)).join(", ");

				if (cur.braces) {
					stack += ")";
				} else if (!isNxtBraces) {
					stack += ")";
					inBraces = false;
				}
			}

			if (cur.condition) stack += ` ${renderer.render(cur.condition)}`;

			if (inBraces && !isNxtBraces) {
				stack += ")";
				inBraces = false;
			}
		} else {
			stack += cur;
		}

		if (nxt) {
			if (nxt.braces) {
				stack += inBraces ? "; " : " (";
				inBraces = true;
			} else stack += ", ";
		}
	}
	if (inBraces) stack += ")";

	return stack.trim();
};

Parser.MONSTER_COUNT_TO_XP_MULTIPLIER = [1, 1.5, 2, 2, 2, 2, 2.5, 2.5, 2.5, 2.5, 3, 3, 3, 3, 4];
Parser.numMonstersToXpMult = function (num, playerCount = 3) {
	const baseVal = (() => {
		if (num >= Parser.MONSTER_COUNT_TO_XP_MULTIPLIER.length) return 4;
		return Parser.MONSTER_COUNT_TO_XP_MULTIPLIER[num - 1];
	})();

	if (playerCount < 3) return baseVal >= 3 ? baseVal + 1 : baseVal + 0.5;
	else if (playerCount > 5) {
		return baseVal === 4 ? 3 : baseVal - 0.5;
	} else return baseVal;
};

Parser.armorFullToAbv = function (armor) {
	return Parser._parse_bToA(Parser.ARMOR_ABV_TO_FULL, armor);
};

Parser.weaponFullToAbv = function (weapon) {
	return Parser._parse_bToA(Parser.WEAPON_ABV_TO_FULL, weapon);
};

Parser._getSourceStringFromSource = function (source) {
	if (source && source.source) return source.source;
	return source;
};
Parser._buildSourceCache = function (dict) {
	const out = {};
	Object.entries(dict).forEach(([k, v]) => out[k.toLowerCase()] = v);
	return out;
};
Parser._sourceJsonCache = null;
Parser.hasSourceJson = function (source) {
	Parser._sourceJsonCache = Parser._sourceJsonCache || Parser._buildSourceCache(Object.keys(Parser.SOURCE_JSON_TO_FULL).mergeMap(k => ({[k]: k})));
	return !!Parser._sourceJsonCache[source.toLowerCase()];
};
Parser._sourceFullCache = null;
Parser.hasSourceFull = function (source) {
	Parser._sourceFullCache = Parser._sourceFullCache || Parser._buildSourceCache(Parser.SOURCE_JSON_TO_FULL);
	return !!Parser._sourceFullCache[source.toLowerCase()];
};
Parser._sourceAbvCache = null;
Parser.hasSourceAbv = function (source) {
	Parser._sourceAbvCache = Parser._sourceAbvCache || Parser._buildSourceCache(Parser.SOURCE_JSON_TO_ABV);
	return !!Parser._sourceAbvCache[source.toLowerCase()];
};
Parser._sourceDateCache = null;
Parser.hasSourceDate = function (source) {
	Parser._sourceDateCache = Parser._sourceDateCache || Parser._buildSourceCache(Parser.SOURCE_JSON_TO_DATE);
	return !!Parser._sourceDateCache[source.toLowerCase()];
};
Parser.sourceJsonToJson = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceJson(source)) return Parser._sourceJsonCache[source.toLowerCase()];
	if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source)) return PrereleaseUtil.sourceJsonToSource(source).json;
	if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source)) return BrewUtil2.sourceJsonToSource(source).json;
	return source;
};
Parser.sourceJsonToFull = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceFull(source)) return Parser._sourceFullCache[source.toLowerCase()].replace(/'/g, "\u2019");
	if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source)) return PrereleaseUtil.sourceJsonToFull(source).replace(/'/g, "\u2019");
	if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source)) return BrewUtil2.sourceJsonToFull(source).replace(/'/g, "\u2019");
	return Parser._parse_aToB(Parser.SOURCE_JSON_TO_FULL, source).replace(/'/g, "\u2019");
};
Parser.sourceJsonToFullCompactPrefix = function (source) {
	return Parser.sourceJsonToFull(source)
		.replace(Parser.UA_PREFIX, Parser.UA_PREFIX_SHORT)
		.replace(/^Unearthed Arcana (\d+): /, "UA$1: ")
		.replace(Parser.AL_PREFIX, Parser.AL_PREFIX_SHORT)
		.replace(Parser.PS_PREFIX, Parser.PS_PREFIX_SHORT);
};
Parser.sourceJsonToAbv = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceAbv(source)) return Parser._sourceAbvCache[source.toLowerCase()];
	if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source)) return PrereleaseUtil.sourceJsonToAbv(source);
	if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source)) return BrewUtil2.sourceJsonToAbv(source);
	return Parser._parse_aToB(Parser.SOURCE_JSON_TO_ABV, source);
};
Parser.sourceJsonToDate = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceDate(source)) return Parser._sourceDateCache[source.toLowerCase()];
	if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source)) return PrereleaseUtil.sourceJsonToDate(source);
	if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source)) return BrewUtil2.sourceJsonToDate(source);
	return Parser._parse_aToB(Parser.SOURCE_JSON_TO_DATE, source, null);
};
Parser.sourceJsonToColor = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceAbv(source)) return "";
	if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source)) return PrereleaseUtil.sourceJsonToColor(source);
	if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source)) return BrewUtil2.sourceJsonToColor(source);
	return "";
};

Parser.sourceJsonToSourceClassname = function (source) {
	const sourceCased = Parser.sourceJsonToJson(source);
	return `source__${sourceCased}`;
};

Parser.sourceJsonToStyle = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceJson(source)) return "";
	if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source)) return PrereleaseUtil.sourceJsonToStyle(source);
	if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source)) return BrewUtil2.sourceJsonToStyle(source);
	return "";
};

Parser.sourceJsonToStylePart = function (source) {
	source = Parser._getSourceStringFromSource(source);
	if (Parser.hasSourceJson(source)) return "";
	if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source)) return PrereleaseUtil.sourceJsonToStylePart(source);
	if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source)) return BrewUtil2.sourceJsonToStylePart(source);
	return "";
};

Parser.sourceJsonToMarkerHtml = function (source, {isList = true, isAddBrackets = null, additionalStyles = ""} = {}) {
	source = Parser._getSourceStringFromSource(source);
	// TODO(Future) consider enabling this
	// if (SourceUtil.isPartneredSourceWotc(source)) return `<span class="help-subtle ve-source-marker ${isList ? `ve-source-marker--list` : ""} ve-source-marker--partnered ${additionalStyles}" title="D&amp;D Partnered Source">${isList ? "" : "["}✦${isList ? "" : "]"}</span>`;
	if (SourceUtil.isLegacySourceWotc(source)) return `<span class="help-subtle ve-source-marker ${isList ? `ve-source-marker--list` : ""} ve-source-marker--legacy ${additionalStyles}" title="Legacy Source">${isList && !isAddBrackets ? "" : "["}ʟ${isList && !isAddBrackets ? "" : "]"}</span>`;
	return "";
};

Parser.stringToSlug = function (str) {
	// return str.trim().toLowerCase().toAscii().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
	return str.trim().toLowerCase().toAscii().toUrlified().replace(/[^\w ]+/g, "").replace(/ +/g, "-")
};

Parser.stringToCasedSlug = function (str) {
	return str.toAscii().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
};

Parser.ITEM_SPELLCASTING_FOCUS_CLASSES = ["Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"];
Parser.CLASSES_TO_CN = {
	"Artificer": "奇械师",
	"Bard": "吟游诗人",
	"Cleric": "牧师",
	"Druid": "德鲁伊",
	"Paladin": "圣武士",
	"Ranger": "游侠",
	"Sorcerer": "术士",
	"Warlock": "邪术师",
	"Wizard": "法师"
}
Parser.itemValueToFull = function (item, opts = { isShortForm: false, isSmallUnits: false }) {
	return Parser._moneyToFull(item, "value", "valueMult", opts);
};

Parser.itemValueToFullMultiCurrency = function (item, opts = { isShortForm: false, isSmallUnits: false }) {
	return Parser._moneyToFullMultiCurrency(item, "value", "valueMult", opts);
};

Parser.itemVehicleCostsToFull = function (item, isShortForm) {
	return {
		travelCostFull: Parser._moneyToFull(item, "travelCost", "travelCostMult", {isShortForm}),
		shippingCostFull: Parser._moneyToFull(item, "shippingCost", "shippingCostMult", {isShortForm}),
	};
};

Parser.spellComponentCostToFull = function (item, isShortForm) {
	return Parser._moneyToFull(item, "cost", "costMult", {isShortForm});
};

Parser.vehicleCostToFull = function (item, isShortForm) {
	return Parser._moneyToFull(item, "cost", "costMult", {isShortForm});
};

Parser._moneyToFull = function (it, prop, propMult, opts = {isShortForm: false, isSmallUnits: false}) {
	if (it[prop] == null && it[propMult] == null) return "";
	if (it[prop] != null) {
		const {coin, mult} = Parser.getCurrencyAndMultiplier(it[prop], it.currencyConversion);
		return `${(it[prop] * mult).toLocaleString(undefined, {maximumFractionDigits: 5})}${opts.isSmallUnits ? `<span class="small ml-1">${coin}</span>` : ` ${coin}`}`;
	} else if (it[propMult] != null) return opts.isShortForm ? `×${it[propMult]}` : `基础加值 ×${it[propMult]}`;
	return "";
};

Parser._moneyToFullMultiCurrency = function (it, prop, propMult, {isShortForm, multiplier} = {}) {
	if (it[prop]) {
		const conversionTable = Parser.getCurrencyConversionTable(it.currencyConversion);

		const simplified = it.currencyConversion
			? CurrencyUtil.doSimplifyCoins(
				{
					// Assume the e.g. item's value is in the lowest available denomination
					[conversionTable[0]?.coin || "cp"]: it[prop] * (multiplier ?? conversionTable[0]?.mult ?? 1),
				},
				{
					currencyConversionId: it.currencyConversion,
				},
			)
			: CurrencyUtil.doSimplifyCoins({
				cp: it[prop] * (multiplier ?? 1),
			});

		return [...conversionTable]
			.reverse()
			.filter(meta => simplified[meta.coin])
			.map(meta => `${simplified[meta.coin].toLocaleString(undefined, {maximumFractionDigits: 5})} ${meta.coin}`)
			.join(", ");
	}

	if (it[propMult]) return isShortForm ? `×${it[propMult]}` : `基础加值 ×${it[propMult]}`;

	return "";
};

Parser.DEFAULT_CURRENCY_CONVERSION_TABLE = [
	{
		coin: "cp",
		mult: 1,
	},
	{
		coin: "sp",
		mult: 0.1,
	},
	{
		coin: "gp",
		mult: 0.01,
		isFallback: true,
	},
];
Parser.FULL_CURRENCY_CONVERSION_TABLE = [
	{
		coin: "cp",
		mult: 1,
	},
	{
		coin: "sp",
		mult: 0.1,
	},
	{
		coin: "ep",
		mult: 0.02,
	},
	{
		coin: "gp",
		mult: 0.01,
		isFallback: true,
	},
	{
		coin: "pp",
		mult: 0.001,
	},
];
Parser.getCurrencyConversionTable = function (currencyConversionId) {
	const fromPrerelease = currencyConversionId ? PrereleaseUtil.getMetaLookup("currencyConversions")?.[currencyConversionId] : null;
	const fromBrew = currencyConversionId ? BrewUtil2.getMetaLookup("currencyConversions")?.[currencyConversionId] : null;
	const conversionTable = fromPrerelease?.length
		? fromPrerelease
		: fromBrew?.length
			? fromBrew
			: Parser.DEFAULT_CURRENCY_CONVERSION_TABLE;
	if (conversionTable !== Parser.DEFAULT_CURRENCY_CONVERSION_TABLE) conversionTable.sort((a, b) => SortUtil.ascSort(b.mult, a.mult));
	return conversionTable;
};
Parser.getCurrencyAndMultiplier = function (value, currencyConversionId) {
	const conversionTable = Parser.getCurrencyConversionTable(currencyConversionId);

	if (!value) return conversionTable.find(it => it.isFallback) || conversionTable[0];
	if (conversionTable.length === 1) return conversionTable[0];
	if (!Number.isInteger(value) && value < conversionTable[0].mult) return conversionTable[0];

	for (let i = conversionTable.length - 1; i >= 0; --i) {
		if (Number.isInteger(value * conversionTable[i].mult)) return conversionTable[i];
	}

	return conversionTable.last();
};

Parser.COIN_ABVS = ["cp", "sp", "ep", "gp", "pp"];
Parser.COIN_ABV_TO_FULL = {
	"cp": "copper pieces",
	"sp": "silver pieces",
	"ep": "electrum pieces",
	"gp": "gold pieces",
	"pp": "platinum pieces",
};
Parser.COIN_CONVERSIONS = [1, 10, 50, 100, 1000];

Parser.coinAbvToFull = function (coin) {
	return Parser._parse_aToB(Parser.COIN_ABV_TO_FULL, coin);
};

/**
 * @param currency Object of the form `{pp: <n>, gp: <m>, ... }`.
 * @param isDisplayEmpty If "empty" values (i.e., those which are 0) should be displayed.
 */
Parser.getDisplayCurrency = function (currency, {isDisplayEmpty = false} = {}) {
	return [...Parser.COIN_ABVS]
		.reverse()
		.filter(abv => isDisplayEmpty ? currency[abv] != null : currency[abv])
		.map(abv => `${currency[abv].toLocaleString()} ${abv}`)
		.join(", ");
};

Parser.itemWeightToFull = function (item, isShortForm) {
	if (item.weight) {
		// Handle pure integers
		if (Math.round(item.weight) === item.weight) return `${item.weight} 磅${(item.weightNote ? ` ${item.weightNote}` : "")}`;

		const integerPart = Math.floor(item.weight);

		// Attempt to render the amount as (a number +) a vulgar
		const vulgarGlyph = Parser.numberToVulgar(item.weight - integerPart, {isFallbackOnFractional: false});
		if (vulgarGlyph) return `${integerPart || ""}${vulgarGlyph} 磅${(item.weightNote ? ` ${item.weightNote}` : "")}`;

		// Fall back on decimal pounds or ounces
		return `${(item.weight < 1 ? item.weight * 16 : item.weight).toLocaleString(undefined, {maximumFractionDigits: 5})} ${item.weight < 1 ? "oz" : "lb"}.${(item.weightNote ? ` ${item.weightNote}` : "")}`;
	}
	if (item.weightMult) return isShortForm ? `×${item.weightMult}` : `基础重量 ×${item.weightMult}`;
	return "";
};

Parser.ITEM_RECHARGE_TO_FULL = {
	round: "Every Round",
	restShort: "Short Rest",
	restLong: "Long Rest",
	dawn: "Dawn",
	dusk: "Dusk",
	midnight: "Midnight",
	week: "Week",
	month: "Month",
	year: "Year",
	decade: "Decade",
	century: "Century",
	special: "Special",
};
Parser.itemRechargeToFull = function (recharge) {
	return Parser._parse_aToB(Parser.ITEM_RECHARGE_TO_FULL, recharge);
};

Parser.ITEM_MISC_TAG_TO_FULL = {
	"CF/W": "创造食物/水",
	"CNS": "消耗品",
	"TT": "小装饰品",
};
Parser.itemMiscTagToFull = function (type) {
	return Parser._parse_aToB(Parser.ITEM_MISC_TAG_TO_FULL, type);
};

Parser.ITM_PROP_ABV__TWO_HANDED = "2H";
Parser.ITM_PROP_ABV__AMMUNITION = "A";
Parser.ITM_PROP_ABV__AMMUNITION_FUTURISTIC = "AF";
Parser.ITM_PROP_ABV__BURST_FIRE = "BF";
Parser.ITM_PROP_ABV__EXTENDED_REACH = "ER";
Parser.ITM_PROP_ABV__FINESSE = "F";
Parser.ITM_PROP_ABV__HEAVY = "H";
Parser.ITM_PROP_ABV__LIGHT = "L";
Parser.ITM_PROP_ABV__LOADING = "LD";
Parser.ITM_PROP_ABV__OTHER = "OTH";
Parser.ITM_PROP_ABV__REACH = "R";
Parser.ITM_PROP_ABV__RELOAD = "RLD";
Parser.ITM_PROP_ABV__SPECIAL = "S";
Parser.ITM_PROP_ABV__THROWN = "T";
Parser.ITM_PROP_ABV__VERSATILE = "V";
Parser.ITM_PROP_ABV__VESTIGE_OF_DIVERGENCE = "Vst";

Parser.ITM_PROP__TWO_HANDED = "2H";
Parser.ITM_PROP__AMMUNITION = "A";
Parser.ITM_PROP__AMMUNITION_FUTURISTIC = "AF|DMG";
Parser.ITM_PROP__BURST_FIRE = "BF|DMG";
Parser.ITM_PROP__EXTENDED_REACH = "ER|TDCSR";
Parser.ITM_PROP__FINESSE = "F";
Parser.ITM_PROP__HEAVY = "H";
Parser.ITM_PROP__LIGHT = "L";
Parser.ITM_PROP__LOADING = "LD";
Parser.ITM_PROP__OTHER = "OTH";
Parser.ITM_PROP__REACH = "R";
Parser.ITM_PROP__RELOAD = "RLD|DMG";
Parser.ITM_PROP__SPECIAL = "S";
Parser.ITM_PROP__THROWN = "T";
Parser.ITM_PROP__VERSATILE = "V";
Parser.ITM_PROP__VESTIGE_OF_DIVERGENCE = "Vst|TDCSR";

Parser.ITM_PROP__ODND_TWO_HANDED = "2H|XPHB";
Parser.ITM_PROP__ODND_AMMUNITION = "A|XPHB";
Parser.ITM_PROP__ODND_FINESSE = "F|XPHB";
Parser.ITM_PROP__ODND_HEAVY = "H|XPHB";
Parser.ITM_PROP__ODND_LIGHT = "L|XPHB";
Parser.ITM_PROP__ODND_LOADING = "LD|XPHB";
Parser.ITM_PROP__ODND_REACH = "R|XPHB";
Parser.ITM_PROP__ODND_THROWN = "T|XPHB";
Parser.ITM_PROP__ODND_VERSATILE = "V|XPHB";

Parser.ITM_TYP_ABV__TREASURE = "$";
Parser.ITM_TYP_ABV__TREASURE_ART_OBJECT = "$A";
Parser.ITM_TYP_ABV__TREASURE_COINAGE = "$C";
Parser.ITM_TYP_ABV__TREASURE_GEMSTONE = "$G";
Parser.ITM_TYP_ABV__AMMUNITION = "A";
Parser.ITM_TYP_ABV__AMMUNITION_FUTURISTIC = "AF";
Parser.ITM_TYP_ABV__VEHICLE_AIR = "AIR";
Parser.ITM_TYP_ABV__ARTISAN_TOOL = "AT";
Parser.ITM_TYP_ABV__EXPLOSIVE = "EXP";
Parser.ITM_TYP_ABV__FOOD_AND_DRINK = "FD";
Parser.ITM_TYP_ABV__ADVENTURING_GEAR = "G";
Parser.ITM_TYP_ABV__GAMING_SET = "GS";
Parser.ITM_TYP_ABV__GENERIC_VARIANT = "GV";
Parser.ITM_TYP_ABV__HEAVY_ARMOR = "HA";
Parser.ITM_TYP_ABV__ILLEGAL_DRUG = "IDG";
Parser.ITM_TYP_ABV__INSTRUMENT = "INS";
Parser.ITM_TYP_ABV__LIGHT_ARMOR = "LA";
Parser.ITM_TYP_ABV__MELEE_WEAPON = "M";
Parser.ITM_TYP_ABV__MEDIUM_ARMOR = "MA";
Parser.ITM_TYP_ABV__MOUNT = "MNT";
Parser.ITM_TYP_ABV__OTHER = "OTH";
Parser.ITM_TYP_ABV__POTION = "P";
Parser.ITM_TYP_ABV__RANGED_WEAPON = "R";
Parser.ITM_TYP_ABV__ROD = "RD";
Parser.ITM_TYP_ABV__RING = "RG";
Parser.ITM_TYP_ABV__SHIELD = "S";
Parser.ITM_TYP_ABV__SCROLL = "SC";
Parser.ITM_TYP_ABV__SPELLCASTING_FOCUS = "SCF";
Parser.ITM_TYP_ABV__VEHICLE_WATER = "SHP";
Parser.ITM_TYP_ABV__VEHICLE_SPACE = "SPC";
Parser.ITM_TYP_ABV__TOOL = "T";
Parser.ITM_TYP_ABV__TACK_AND_HARNESS = "TAH";
Parser.ITM_TYP_ABV__TRADE_GOOD = "TG";
Parser.ITM_TYP_ABV__VEHICLE_LAND = "VEH";
Parser.ITM_TYP_ABV__WAND = "WD";

Parser.ITM_TYP__TREASURE = "$|DMG";
Parser.ITM_TYP__TREASURE_ART_OBJECT = "$A|DMG";
Parser.ITM_TYP__TREASURE_COINAGE = "$C";
Parser.ITM_TYP__TREASURE_GEMSTONE = "$G|DMG";
Parser.ITM_TYP__AMMUNITION = "A";
Parser.ITM_TYP__AMMUNITION_FUTURISTIC = "AF|DMG";
Parser.ITM_TYP__VEHICLE_AIR = "AIR|DMG";
Parser.ITM_TYP__ARTISAN_TOOL = "AT";
Parser.ITM_TYP__EXPLOSIVE = "EXP|DMG";
Parser.ITM_TYP__FOOD_AND_DRINK = "FD";
Parser.ITM_TYP__ADVENTURING_GEAR = "G";
Parser.ITM_TYP__GAMING_SET = "GS";
Parser.ITM_TYP__GENERIC_VARIANT = "GV|DMG";
Parser.ITM_TYP__HEAVY_ARMOR = "HA";
Parser.ITM_TYP__ILLEGAL_DRUG = "IDG|TDCSR";
Parser.ITM_TYP__INSTRUMENT = "INS";
Parser.ITM_TYP__LIGHT_ARMOR = "LA";
Parser.ITM_TYP__MELEE_WEAPON = "M";
Parser.ITM_TYP__MEDIUM_ARMOR = "MA";
Parser.ITM_TYP__MOUNT = "MNT";
Parser.ITM_TYP__OTHER = "OTH";
Parser.ITM_TYP__POTION = "P";
Parser.ITM_TYP__RANGED_WEAPON = "R";
Parser.ITM_TYP__ROD = "RD|DMG";
Parser.ITM_TYP__RING = "RG|DMG";
Parser.ITM_TYP__SHIELD = "S";
Parser.ITM_TYP__SCROLL = "SC|DMG";
Parser.ITM_TYP__SPELLCASTING_FOCUS = "SCF";
Parser.ITM_TYP__VEHICLE_WATER = "SHP";
Parser.ITM_TYP__VEHICLE_SPACE = "SPC|AAG";
Parser.ITM_TYP__TOOL = "T";
Parser.ITM_TYP__TACK_AND_HARNESS = "TAH";
Parser.ITM_TYP__TRADE_GOOD = "TG";
Parser.ITM_TYP__VEHICLE_LAND = "VEH";
Parser.ITM_TYP__WAND = "WD|DMG";

Parser.ITM_TYP__ODND_TREASURE_ART_OBJECT = "$A|XDMG";
Parser.ITM_TYP__ODND_TREASURE_COINAGE = "$C|XPHB";
Parser.ITM_TYP__ODND_TREASURE_GEMSTONE = "$G|XDMG";
Parser.ITM_TYP__ODND_AMMUNITION = "A|XPHB";
Parser.ITM_TYP__ODND_AMMUNITION_FUTURISTIC = "AF|XDMG";
Parser.ITM_TYP__ODND_VEHICLE_AIR = "AIR|XPHB";
Parser.ITM_TYP__ODND_ARTISAN_TOOL = "AT|XPHB";
Parser.ITM_TYP__ODND_EXPLOSIVE = "EXP|XDMG";
Parser.ITM_TYP__ODND_FOOD_AND_DRINK = "FD|XPHB";
Parser.ITM_TYP__ODND_ADVENTURING_GEAR = "G|XPHB";
Parser.ITM_TYP__ODND_GAMING_SET = "GS|XPHB";
Parser.ITM_TYP__ODND_GENERIC_VARIANT = "GV|XDMG";
Parser.ITM_TYP__ODND_HEAVY_ARMOR = "HA|XPHB";
Parser.ITM_TYP__ODND_INSTRUMENT = "INS|XPHB";
Parser.ITM_TYP__ODND_LIGHT_ARMOR = "LA|XPHB";
Parser.ITM_TYP__ODND_MELEE_WEAPON = "M|XPHB";
Parser.ITM_TYP__ODND_MEDIUM_ARMOR = "MA|XPHB";
Parser.ITM_TYP__ODND_MOUNT = "MNT|XPHB";
Parser.ITM_TYP__ODND_POTION = "P|XPHB";
Parser.ITM_TYP__ODND_RANGED_WEAPON = "R|XPHB";
Parser.ITM_TYP__ODND_ROD = "RD|XDMG";
Parser.ITM_TYP__ODND_RING = "RG|XDMG";
Parser.ITM_TYP__ODND_SHIELD = "S|XPHB";
Parser.ITM_TYP__ODND_SCROLL = "SC|XPHB";
Parser.ITM_TYP__ODND_SPELLCASTING_FOCUS = "SCF|XPHB";
Parser.ITM_TYP__ODND_VEHICLE_WATER = "SHP|XPHB";
Parser.ITM_TYP__ODND_TOOL = "T|XPHB";
Parser.ITM_TYP__ODND_TACK_AND_HARNESS = "TAH|XPHB";
Parser.ITM_TYP__ODND_TRADE_GOOD = "TG|XDMG";
Parser.ITM_TYP__ODND_VEHICLE_LAND = "VEH|XPHB";
Parser.ITM_TYP__ODND_WAND = "WD|XDMG";

Parser._decimalSeparator = (0.1).toLocaleString().substring(1, 2);
Parser._numberCleanRegexp = Parser._decimalSeparator === "." ? new RegExp(/[\s,]*/g, "g") : new RegExp(/[\s.]*/g, "g");
Parser._costSplitRegexp = Parser._decimalSeparator === "." ? new RegExp(/(\d+(\.\d+)?)([csegp]p)/) : new RegExp(/(\d+(,\d+)?)([csegp]p)/);

/** input e.g. "25 gp", "1,000pp" */
Parser.coinValueToNumber = function (value) {
	if (!value) return 0;
	// handle oddities
	if (value === "Varies") return 0;

	value = value
		.replace(/\s*/, "")
		.replace(Parser._numberCleanRegexp, "")
		.toLowerCase();
	const m = Parser._costSplitRegexp.exec(value);
	if (!m) throw new Error(`Badly formatted value "${value}"`);
	const ixCoin = Parser.COIN_ABVS.indexOf(m[3]);
	if (!~ixCoin) throw new Error(`Unknown coin type "${m[3]}"`);
	return Number(m[1]) * Parser.COIN_CONVERSIONS[ixCoin];
};

Parser.weightValueToNumber = function (value) {
	if (!value) return 0;

	if (Number(value)) return Number(value);
	else throw new Error(`Badly formatted value ${value}`);
};

Parser.dmgTypeToFull = function (dmgType) {
	return Parser._parse_aToB(Parser.DMGTYPE_JSON_TO_FULL, dmgType);
};

Parser.skillProficienciesToFull = function (skillProficiencies, {styleHint = null} = {}) {
	styleHint ||= VetoolsConfig.get("styleSwitcher", "style");

	const ptSource = styleHint === "classic" ? Parser.SRC_PHB : Parser.SRC_XPHB;

	function renderSingle (skProf) {
		if (skProf.any) {
			skProf = MiscUtil.copyFast(skProf);
			skProf.choose = {"from": Object.keys(Parser.SKILL_TO_ATB_ABV), "count": skProf.any};
			delete skProf.any;
		}

		const keys = Object.keys(skProf).sort(SortUtil.ascSortLower);

		const ixChoose = keys.indexOf("choose");
		if (~ixChoose) keys.splice(ixChoose, 1);

		const baseStack = [];
		keys.filter(k => skProf[k]).forEach(k => baseStack.push(Renderer.get().render(`{@skill ${k.toTitleCase()}|${ptSource}}`)));

		let ptChoose = "";
		if (~ixChoose) {
			const chObj = skProf.choose;
			const count = chObj.count ?? 1;
			if (chObj.from.length === 18) {
				ptChoose = styleHint === "classic"
					? `choose any ${count === 1 ? "skill" : chObj.count}`
					: `选择 ${chObj.count}个`;
			} else {
				ptChoose = styleHint === "classic"
					? `choose ${count} from ${chObj.from.map(it => Renderer.get().render(`{@skill ${it.toTitleCase()}|${ptSource}}`)).joinConjunct(", ", " 和 ")}`
					: Renderer.get().render(`{@i Choose ${count}:} ${chObj.from.map(it => `{@skill ${it.toTitleCase()}|${ptSource}}`).joinConjunct(", ", " 或 ")}`);
			}
		}

		const base = baseStack.joinConjunct(", ", " and ");

		if (baseStack.length && ptChoose.length) return `${base}; and ${ptChoose}`;
		else if (baseStack.length) return base;
		else if (ptChoose.length) return ptChoose;
	}

	return skillProficiencies.map(renderSingle).join(` <i>or</i> `);
};

// sp-prefix functions are for parsing spell data, and shared with the roll20 script
Parser.spSchoolAndSubschoolsAbvsToFull = function (school, subschools) {
	if (!subschools || !subschools.length) return Parser.spSchoolAbvToFull(school);
	else return `${Parser.spSchoolAbvToFull(school)} (${subschools.map(sub => Parser.spSchoolAbvToFull(sub)).join(", ")})`;
};

Parser.spSchoolAbvToFull = function (schoolOrSubschool) {
	const out = Parser._parse_aToB(Parser.SP_SCHOOL_ABV_TO_FULL, schoolOrSubschool);
	if (Parser.SP_SCHOOL_ABV_TO_FULL[schoolOrSubschool]) return out;
	if (PrereleaseUtil.getMetaLookup("spellSchools")?.[schoolOrSubschool]) return PrereleaseUtil.getMetaLookup("spellSchools")?.[schoolOrSubschool].full;
	if (BrewUtil2.getMetaLookup("spellSchools")?.[schoolOrSubschool]) return BrewUtil2.getMetaLookup("spellSchools")?.[schoolOrSubschool].full;
	return out;
};

Parser.spSchoolAndSubschoolsAbvsShort = function (school, subschools) {
	if (!subschools || !subschools.length) return Parser.spSchoolAbvToShort(school);
	else return `${Parser.spSchoolAbvToShort(school)} (${subschools.map(sub => Parser.spSchoolAbvToShort(sub)).join(", ")})`;
};

Parser.spSchoolAbvToShort = function (school) {
	const out = Parser._parse_aToB(Parser.SP_SCHOOL_ABV_TO_SHORT, school);
	if (Parser.SP_SCHOOL_ABV_TO_SHORT[school]) return out;
	if (PrereleaseUtil.getMetaLookup("spellSchools")?.[school]) return PrereleaseUtil.getMetaLookup("spellSchools")?.[school].short;
	if (BrewUtil2.getMetaLookup("spellSchools")?.[school]) return BrewUtil2.getMetaLookup("spellSchools")?.[school].short;
	if (out.length <= 4) return out;
	return `${out.slice(0, 3)}.`;
};

Parser.spSchoolAbvToStyle = function (school) { // For prerelease/homebrew
	const stylePart = Parser.spSchoolAbvToStylePart(school);
	if (!stylePart) return stylePart;
	return `style="${stylePart}"`;
};

Parser.spSchoolAbvToStylePart = function (school) { // For prerelease/homebrew
	return Parser._spSchoolAbvToStylePart_prereleaseBrew({school, brewUtil: PrereleaseUtil})
		|| Parser._spSchoolAbvToStylePart_prereleaseBrew({school, brewUtil: BrewUtil2})
		|| "";
};

Parser._spSchoolAbvToStylePart_prereleaseBrew = function ({school, brewUtil}) {
	const rawColor = brewUtil.getMetaLookup("spellSchools")?.[school]?.color;
	if (!rawColor || !rawColor.trim()) return "";
	const validColor = BrewUtilShared.getValidColor(rawColor);
	if (validColor.length) return MiscUtil.getColorStylePart(validColor);
};

Parser.getOrdinalForm = function (i) {
	i = Number(i);
	if (isNaN(i)) return "";
	// const j = i % 10; const k = i % 100;
	// if (j === 1 && k !== 11) return `${i}st`;
	// if (j === 2 && k !== 12) return `${i}nd`;
	// if (j === 3 && k !== 13) return `${i}rd`;
	// return `${i}th`;
	return `${i}`
};

Parser.spLevelToFull = function (level) {
	if (level === 0) return "戏法";
	else return Parser.getOrdinalForm(level) + '环';
};

Parser.getArticle = function (str) {
	str = `${str}`;
	str = str.replace(/\d+/g, (...m) => Parser.numberToText(m[0]));
	return /^[aeiou]/i.test(str) ? "an" : "a";
};

Parser.spLevelToFullLevelText = function (level, { isDash = false, isPluralCantrips = true } = {}) {
	return `${Parser.spLevelToFull(level)}${(level === 0 ? (isPluralCantrips ? "s" : "") : `${isDash ? "-" : " "}`)}`;
};

Parser.spLevelToSpellPoints = function (lvl) {
	lvl = Number(lvl);
	if (isNaN(lvl) || lvl === 0) return 0;
	return Math.ceil(1.34 * lvl);
};

Parser.spMetaToArr = function (meta) {
	if (!meta) return [];
	return Object.entries(meta)
		.filter(([_, v]) => v)
		.sort(SortUtil.ascSort)
		.map(([k]) => k);
};

Parser.spMetaToFull = function (meta) {
	if (!meta) return "";
	const metaTags = Parser.spMetaToArr(meta);
	if (metaTags.length) return ` (${metaTags.join(", ")})`;
	return "";
};

Parser.spLevelSchoolMetaToFull = function (level, school, meta, subschools) {
	const levelPart = level === 0 ? Parser.spLevelToFull(level).toLowerCase() : `${Parser.spLevelToFull(level)}`;
	const levelSchoolStr = level === 0 ? `${Parser.spSchoolAbvToFull(school)} ${levelPart}` : `${levelPart} ${Parser.spSchoolAbvToFull(school).toLowerCase()}`;

	const metaArr = Parser.spMetaToArr(meta);
	if (metaArr.length || (subschools && subschools.length)) {
		const metaAndSubschoolPart = [
			(subschools || []).map(sub => Parser.spSchoolAbvToFull(sub)).join(", "),
			metaArr.join(", "),
		].filter(Boolean).join("; ").toLowerCase();
		return `${levelSchoolStr} (${metaAndSubschoolPart})`;
	}
	return levelSchoolStr;
};

Parser.spTimeListToFull = function (times, isStripTags) {
	return times.map(t => `${Parser.getTimeToFull(t)}${t.condition ? `, ${isStripTags ? Renderer.stripTags(t.condition) : Renderer.get().render(t.condition)}` : ""}`).join(" or ");
};

Parser.getTimeToFull = function (time) {
	return `${time.number ? `${time.number} ` : ""}${time.unit === "bonus" ? "bonus action" : time.unit}${time.number > 1 ? "s" : ""}`;
};

Parser.getMinutesToFull = function (mins, {isShort = false} = {}) {
	const days = Math.floor(mins / (24 * 60));
	mins = mins % (24 * 60);

	const hours = Math.floor(mins / 60);
	mins = mins % 60;

	return [
		days ? `${days} ${isShort ? `d` : `天`}` : null,
		hours ? `${hours} ${isShort ? `h` : `小时`}` : null,
		mins ? `${mins} ${isShort ? `m` : `分钟`}` : null,
	].filter(Boolean)
		.join(" ");
};

Parser.RNG_SPECIAL = "special";
Parser.RNG_POINT = "point";
Parser.RNG_LINE = "line";
Parser.RNG_CUBE = "cube";
Parser.RNG_CONE = "cone";
Parser.RNG_EMANATION = "emanation";
Parser.RNG_RADIUS = "radius";
Parser.RNG_SPHERE = "sphere";
Parser.RNG_HEMISPHERE = "hemisphere";
Parser.RNG_CYLINDER = "cylinder"; // homebrew only
Parser.RNG_SELF = "self";
Parser.RNG_SIGHT = "sight";
Parser.RNG_UNLIMITED = "unlimited";
Parser.RNG_UNLIMITED_SAME_PLANE = "plane";
Parser.RNG_TOUCH = "touch";
Parser.SP_RANGE_TYPE_TO_FULL = {
	[Parser.RNG_SPECIAL]: "特殊",
	[Parser.RNG_POINT]: "Point",
	[Parser.RNG_LINE]: "线型",
	[Parser.RNG_CUBE]: "立方体",
	[Parser.RNG_CONE]: "锥形",
	[Parser.RNG_RADIUS]: "半径",
	[Parser.RNG_SPHERE]: "Sphere",
	[Parser.RNG_HEMISPHERE]: "半球体",
	[Parser.RNG_CYLINDER]: "Cylinder",
	[Parser.RNG_SELF]: "自身",
	[Parser.RNG_SIGHT]: "Sight",
	[Parser.RNG_UNLIMITED]: "无限",
	[Parser.RNG_UNLIMITED_SAME_PLANE]: "Unlimited on the same plane",
	[Parser.RNG_TOUCH]: "触及",
};

Parser.spRangeTypeToFull = function (range) {
	return Parser._parse_aToB(Parser.SP_RANGE_TYPE_TO_FULL, range);
};

Parser.UNT_LBS = "lbs";
Parser.UNT_TONS_IMPERIAL = "tns";
Parser.UNT_TONS_METRIC = "Mg";

Parser.UNT_FEET = "feet";
Parser.UNT_YARDS = "yards";
Parser.UNT_MILES = "miles";
Parser.SP_DIST_TYPE_TO_FULL = {
	[Parser.UNT_FEET]: "尺",
	[Parser.UNT_YARDS]: "码",
	[Parser.UNT_MILES]: "里",
	[Parser.RNG_SELF]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_SELF],
	[Parser.RNG_TOUCH]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_TOUCH],
	[Parser.RNG_SIGHT]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_SIGHT],
	[Parser.RNG_UNLIMITED]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_UNLIMITED],
	[Parser.RNG_UNLIMITED_SAME_PLANE]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_UNLIMITED_SAME_PLANE],
};

Parser.spDistanceTypeToFull = function (range) {
	return Parser._parse_aToB(Parser.SP_DIST_TYPE_TO_FULL, range);
};

Parser.SP_RANGE_TO_ICON = {
	[Parser.RNG_SPECIAL]: "fa-star",
	[Parser.RNG_POINT]: "",
	[Parser.RNG_LINE]: "fa-grip-lines-vertical",
	[Parser.RNG_CUBE]: "fa-cube",
	[Parser.RNG_CONE]: "fa-traffic-cone",
	[Parser.RNG_EMANATION]: "fa-hockey-puck",
	[Parser.RNG_RADIUS]: "fa-hockey-puck",
	[Parser.RNG_SPHERE]: "fa-globe",
	[Parser.RNG_HEMISPHERE]: "fa-globe",
	[Parser.RNG_CYLINDER]: "fa-database",
	[Parser.RNG_SELF]: "fa-street-view",
	[Parser.RNG_SIGHT]: "fa-eye",
	[Parser.RNG_UNLIMITED_SAME_PLANE]: "fa-globe-americas",
	[Parser.RNG_UNLIMITED]: "fa-infinity",
	[Parser.RNG_TOUCH]: "fa-hand-paper",
};

Parser.spRangeTypeToIcon = function (range) {
	return Parser._parse_aToB(Parser.SP_RANGE_TO_ICON, range);
};

Parser.spRangeToShortHtml = function (range) {
	switch (range.type) {
		case Parser.RNG_SPECIAL: return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(range.type)} help-subtle" title="Special"></span>`;
		case Parser.RNG_POINT: return Parser.spRangeToShortHtml._renderPoint(range);
		case Parser.RNG_LINE:
		case Parser.RNG_CUBE:
		case Parser.RNG_CONE:
		case Parser.RNG_EMANATION:
		case Parser.RNG_RADIUS:
		case Parser.RNG_SPHERE:
		case Parser.RNG_HEMISPHERE:
		case Parser.RNG_CYLINDER:
			return Parser.spRangeToShortHtml._renderArea(range);
	}
};
Parser.spRangeToShortHtml._renderPoint = function (range) {
	const dist = range.distance;
	switch (dist.type) {
		case Parser.RNG_SELF:
		case Parser.RNG_SIGHT:
		case Parser.RNG_UNLIMITED:
		case Parser.RNG_UNLIMITED_SAME_PLANE:
		case Parser.RNG_SPECIAL:
		case Parser.RNG_TOUCH: return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(dist.type)} help-subtle" title="${Parser.spRangeTypeToFull(dist.type)}"></span>`;
		case Parser.UNT_FEET:
		case Parser.UNT_YARDS:
		case Parser.UNT_MILES:
		default:
			return `${dist.amount} <span class="ve-small">${Parser.getSingletonUnit(dist.type, true)}</span>`;
	}
};
Parser.spRangeToShortHtml._renderArea = function (range) {
	const size = range.distance;
	return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(Parser.RNG_SELF)} help-subtle" title="Self"></span> ${size.amount}<span class="ve-small">-${Parser.getSingletonUnit(size.type, true)}</span> ${Parser.spRangeToShortHtml._getAreaStyleString(range)}`;
};
Parser.spRangeToShortHtml._getAreaStyleString = function (range) {
	return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(range.type)} help-subtle" title="${Parser.spRangeTypeToFull(range.type)}"></span>`;
};

Parser.spRangeToFull = function (range) {
	switch (range.type) {
		case Parser.RNG_SPECIAL: return Parser.spRangeTypeToFull(range.type);
		case Parser.RNG_POINT: return Parser.spRangeToFull._renderPoint(range);
		case Parser.RNG_LINE:
		case Parser.RNG_CUBE:
		case Parser.RNG_CONE:
		case Parser.RNG_EMANATION:
		case Parser.RNG_RADIUS:
		case Parser.RNG_SPHERE:
		case Parser.RNG_HEMISPHERE:
		case Parser.RNG_CYLINDER:
			return Parser.spRangeToFull._renderArea(range);
	}
};
Parser.spRangeToFull._renderPoint = function (range) {
	const dist = range.distance;
	switch (dist.type) {
		case Parser.RNG_SELF:
		case Parser.RNG_SIGHT:
		case Parser.RNG_UNLIMITED:
		case Parser.RNG_UNLIMITED_SAME_PLANE:
		case Parser.RNG_SPECIAL:
		case Parser.RNG_TOUCH: return Parser.spRangeTypeToFull(dist.type);
		case Parser.UNT_FEET:
		case Parser.UNT_YARDS:
		case Parser.UNT_MILES:
		default:
			return `${dist.amount} ${dist.amount === 1 ? Parser.getSingletonUnit(dist.type) : Parser.spDistanceTypeToFull(dist.type)}`;
	}
};
Parser.spRangeToFull._renderArea = function (range) {
	const size = range.distance;
	return `自身 (${size.amount}-${Parser.getSingletonUnit(size.type)}${Parser.spRangeToFull._getAreaStyleString(range)}${range.type === Parser.RNG_CYLINDER ? `${size.amountSecondary != null && size.typeSecondary != null ? `, ${size.amountSecondary}-${Parser.getSingletonUnit(size.typeSecondary)}-高` : ""} 圆柱体` : ""})`;
};
Parser.spRangeToFull._getAreaStyleString = function (range) {
	switch (range.type) {
		case Parser.RNG_SPHERE: return " 半径";
		case Parser.RNG_HEMISPHERE: return `-半径 ${Parser.spRangeTypeToFull(range.type)}`;
		case Parser.RNG_CYLINDER: return "-半径";
		default: return ` ${Parser.spRangeTypeToFull(range.type)}`;
	}
};

Parser.getSingletonUnit = function (unit, isShort) {
	switch (unit) {
		case Parser.UNT_FEET:
			return isShort ? "ft." : "尺";
		case Parser.UNT_YARDS:
			return isShort ? "yd." : "码";
		case Parser.UNT_MILES:
			return isShort ? "mi." : "里";
		default: {
			const fromPrerelease = Parser._getSingletonUnit_prereleaseBrew({unit, isShort, brewUtil: PrereleaseUtil});
			if (fromPrerelease) return fromPrerelease;

			const fromBrew = Parser._getSingletonUnit_prereleaseBrew({unit, isShort, brewUtil: BrewUtil2});
			if (fromBrew) return fromBrew;

			if (unit.charAt(unit.length - 1) === "s") return unit.slice(0, -1);
			return unit;
		}
	}
};

Parser._getSingletonUnit_prereleaseBrew = function ({unit, isShort, brewUtil}) {
	const fromBrew = brewUtil.getMetaLookup("spellDistanceUnits")?.[unit]?.["singular"];
	if (fromBrew) return fromBrew;
};

Parser.RANGE_TYPES = [
	{type: Parser.RNG_POINT, hasDistance: true, isRequireAmount: false},

	{type: Parser.RNG_LINE, hasDistance: true, isRequireAmount: true},
	{type: Parser.RNG_CUBE, hasDistance: true, isRequireAmount: true},
	{type: Parser.RNG_CONE, hasDistance: true, isRequireAmount: true},
	{type: Parser.RNG_EMANATION, hasDistance: true, isRequireAmount: true},
	{type: Parser.RNG_RADIUS, hasDistance: true, isRequireAmount: true},
	{type: Parser.RNG_SPHERE, hasDistance: true, isRequireAmount: true},
	{type: Parser.RNG_HEMISPHERE, hasDistance: true, isRequireAmount: true},
	{type: Parser.RNG_CYLINDER, hasDistance: true, isRequireAmount: true},

	{type: Parser.RNG_SPECIAL, hasDistance: false, isRequireAmount: false},
];

Parser.DIST_TYPES = [
	{type: Parser.RNG_SELF, hasAmount: false},
	{type: Parser.RNG_TOUCH, hasAmount: false},

	{type: Parser.UNT_FEET, hasAmount: true},
	{type: Parser.UNT_YARDS, hasAmount: true},
	{type: Parser.UNT_MILES, hasAmount: true},

	{type: Parser.RNG_SIGHT, hasAmount: false},
	{type: Parser.RNG_UNLIMITED_SAME_PLANE, hasAmount: false},
	{type: Parser.RNG_UNLIMITED, hasAmount: false},
];

Parser.spComponentsToFull = function (comp, level, {isPlainText = false} = {}) {
	if (!comp) return "无";
	const out = [];
	if (comp.v) out.push("声音");
	if (comp.s) out.push("姿势");
	if (comp.m != null) {
		const fnRender = isPlainText ? Renderer.stripTags.bind(Renderer) : Renderer.get().render.bind(Renderer.get());
		out.push(`材料${comp.m !== true ? ` (${fnRender(comp.m.text != null ? comp.m.text : comp.m)})` : ""}`);
	}
	if (comp.r) out.push(`版税 (${level} gp)`);
	return out.join(", ") || "无";
};

Parser.SP_END_TYPE_TO_FULL = {
	"dispel": "dispelled",
	"trigger": "triggered",
	"discharge": "discharged",
};
Parser.spEndTypeToFull = function (type) {
	return Parser._parse_aToB(Parser.SP_END_TYPE_TO_FULL, type);
};

Parser.spDurationToFull = function (dur) {
	let hasSubOr = false;
	const outParts = dur.map(d => {
		switch (d.type) {
			case "special":
				return "特殊";
			case "instant":
				return `即效${d.condition ? ` (${d.condition})` : ""}`;
			case "timed":
				return `${d.concentration ? "专注, " : ""}至多${d.duration.amount}${Parser.spTimeUnitToFull( d.duration.type)}`;
			case "permanent": {
				if (d.ends) {
					const endsToJoin = d.ends.map(m => Parser.spEndTypeToFull(m));
					hasSubOr = hasSubOr || endsToJoin.length > 1;
					return `直到 ${endsToJoin.joinConjunct(", ", " 或 ")}`;
				} else {
					return "永久";
				}
			}
		}
	});
	return `${outParts.joinConjunct(hasSubOr ? "; " : ", ", " 或 ")}${dur.length > 1 ? " (see below)" : ""}`;
};

Parser.DURATION_TYPES = [
	{type: "instant", full: "即效"},
	{type: "timed", hasAmount: true},
	{type: "permanent", hasEnds: true},
	{type: "special"},
];

Parser.DURATION_AMOUNT_TYPES = [
	"turn",
	"round",
	"minute",
	"hour",
	"day",
	"week",
	"month",
	"year",
];

Parser.spClassesToFull = function (sp, {isTextOnly = false, subclassLookup = {}} = {}) {
	const fromSubclassList = Renderer.spell.getCombinedClasses(sp, "fromSubclass");
	const fromSubclasses = Parser.spSubclassesToFull(fromSubclassList, {isTextOnly, subclassLookup});
	const fromClassList = Renderer.spell.getCombinedClasses(sp, "fromClassList");
	return `${Parser.spMainClassesToFull(fromClassList, {isTextOnly})}${fromSubclasses ? `, ${fromSubclasses}` : ""}`;
};

Parser.spMainClassesToFull = function (fromClassList, {isTextOnly = false} = {}) {
	return fromClassList
		.map(clsStub => ({hash: UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](clsStub), clsStub}))
		.filter(it => !ExcludeUtil.isInitialised || !ExcludeUtil.isExcluded(it.hash, "class", it.clsStub.source))
		.sort((a, b) => SortUtil.ascSort(a.clsStub.name, b.clsStub.name))
		.map(it => {
			if (isTextOnly) return it.clsStub.name;

			const definedInSource = it.clsStub.definedInSource || it.clsStub.source;
			const ptLink = Renderer.get().render(`{@class ${it.clsStub.name}|${it.clsStub.source}}`);
			const ptTitle = definedInSource === it.clsStub.source ? `Class source/spell list defined in: ${Parser.sourceJsonToFull(definedInSource)}.` : `Class source: ${Parser.sourceJsonToFull(it.clsStub.source)}. Spell list defined in: ${Parser.sourceJsonToFull(definedInSource)}.`;
			return `<span title="${ptTitle.qq()}">${ptLink}</span>`;
		})
		.join(", ") || "";
};

Parser.spSubclassesToFull = function (fromSubclassList, {isTextOnly = false, subclassLookup = {}} = {}) {
	return fromSubclassList
		.filter(mt => {
			if (!ExcludeUtil.isInitialised) return true;
			const excludeClass = ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](mt.class), "class", mt.class.source);
			if (excludeClass) return false;

			return !ExcludeUtil.isExcluded(
				UrlUtil.URL_TO_HASH_BUILDER["subclass"]({
					shortName: mt.subclass.name,
					source: mt.subclass.source,
					className: mt.class.name,
					classSource: mt.class.source,
				}),
				"subclass",
				mt.subclass.source,
				{isNoCount: true},
			);
		})
		.sort((a, b) => {
			const byName = SortUtil.ascSort(a.class.name, b.class.name);
			return byName || SortUtil.ascSort(a.subclass.name, b.subclass.name);
		})
		.map(c => Parser._spSubclassItem({fromSubclass: c, isTextOnly}))
		.join(", ") || "";
};

Parser._spSubclassItem = function ({fromSubclass, isTextOnly}) {
	const c = fromSubclass.class;
	const sc = fromSubclass.subclass;
	const text = `${sc.shortName}${sc.subSubclass ? ` (${sc.subSubclass})` : ""}`;
	if (isTextOnly) return text;

	const classPart = `<span title="Source: ${Parser.sourceJsonToFull(c.source)}${c.definedInSource ? ` From a class spell list defined in: ${Parser.sourceJsonToFull(c.definedInSource)}` : ""}">${Renderer.get().render(`{@class ${c.name}|${c.source}}`)}</span>`;

	return `<span class="italic" title="Source: ${Parser.sourceJsonToFull(fromSubclass.subclass.source)}">${Renderer.get().render(`{@class ${c.name}|${c.source}|${text}|${sc.shortName}|${sc.source}}`)}</span> ${classPart}`;
};

Parser.SPELL_ATTACK_TYPE_TO_FULL = {};
Parser.SPELL_ATTACK_TYPE_TO_FULL["M"] = "近战";
Parser.SPELL_ATTACK_TYPE_TO_FULL["R"] = "远程";
Parser.SPELL_ATTACK_TYPE_TO_FULL["O"] = "其他/不明";

Parser.spAttackTypeToFull = function (type) {
	return Parser._parse_aToB(Parser.SPELL_ATTACK_TYPE_TO_FULL, type);
};

Parser.SPELL_AREA_TYPE_TO_FULL = {
	"ST": "单目标",
	"MT": "多目标",
	"C": "立方体",
	"N": "锥形",
	"Y": "圆柱体",
	"S": "球体",
	"R": "圆形",
	"Q": "正方形",
	"L": "线形",
	"H": "半球体",
	"W": "墙壁",
};
Parser.spAreaTypeToFull = function (type) {
	return Parser._parse_aToB(Parser.SPELL_AREA_TYPE_TO_FULL, type);
};

Parser.SP_MISC_TAG_TO_FULL = {
	"HL": "治疗",
	"THP": "提供临时生命值",
	"SGT": "需要视野",
	"PRM": "永久效应",
	"SCL": "动态变化的效应",
	"SCT": "Scaling Targets",
	"SMN": "召唤生物",
	"MAC": "改变AC",
	"TP": "传送",
	"FMV": "强制移动",
	"RO": "骰点效应",
	"LGTS": "制造阳光",
	"LGT": "制造光亮",
	"UBA": "使用附赠动作",
	"PS": "位面传送",
	"OBS": "遮蔽视野",
	"DFT": "困难地形",
	"AAD": "额外攻击伤害",
	"OBJ": "影响物品",
	"ADV": "提供优势",
	"PIR": "重复施法使效用永久",
};
Parser.spMiscTagToFull = function (type) {
	return Parser._parse_aToB(Parser.SP_MISC_TAG_TO_FULL, type);
};

Parser.SP_CASTER_PROGRESSION_TO_FULL = {
	full: "Full",
	"1/2": "Half",
	"1/3": "One-Third",
	"pact": "Pact Magic",
};
Parser.spCasterProgressionToFull = function (type) {
	return Parser._parse_aToB(Parser.SP_CASTER_PROGRESSION_TO_FULL, type);
};

// mon-prefix functions are for parsing monster data, and shared with the roll20 script
Parser.monTypeToFullObj = function (type) {
	const out = {
		types: [],
		tags: [],
		asText: "",
		asTextShort: "",

		typeSidekick: null,
		tagsSidekick: [],
		asTextSidekick: null,
	};
	if (type == null) return out;

	// handles e.g. "fey"
	if (typeof type === "string") {
		out.types = [type];
		out.asText = Parser.monTypeToPlural(type) || type.toTitleCase();
		out.asTextShort = out.asText;
		return out;
	}

	if (type.type?.choose) {
		out.types = type.type.choose;
	} else {
		out.types = [type.type];
	}

	if (type.swarmSize) {
		out.tags.push("swarm");
		out.asText = `${out.types.map(typ => Parser.monTypeToPlural(typ).toTitleCase()).joinConjunct(", ", " 或 ")}的${Parser.sizeAbvToFull(type.swarmSize)}集群`;
		out.asTextShort = out.asText;
		out.swarmSize = type.swarmSize;
	} else {
		out.asText = out.types.map(typ => Parser.monTypeToPlural(typ)).joinConjunct(", ", " 或 ");
		out.asTextShort = out.asText;
	}

	const tagMetas = Parser.monTypeToFullObj._getTagMetas(type.tags);
	if (tagMetas.length) {
		out.tags.push(...tagMetas.map(({ filterTag }) => filterTag));
		const ptTags = ` (${tagMetas.map(({ displayTag }) => displayTag).join(", ")})`;
		out.asText += ptTags;
		out.asTextShort += ptTags;
	}

	if (type.note) out.asText += ` ${type.note}`;

	// region Sidekick
	if (type.sidekickType) {
		out.typeSidekick = type.sidekickType;
		if (!type.sidekickHidden) out.asTextSidekick = `${Parser.MON_SIDEKICK_TO_CN[type.sidekickType] || type.sidekickType}`;

		const tagMetas = Parser.monTypeToFullObj._getTagMetas(type.sidekickTags);
		if (tagMetas.length) {
			out.tagsSidekick.push(...tagMetas.map(({ filterTag }) => filterTag));
			if (!type.sidekickHidden) out.asTextSidekick += ` (${tagMetas.map(({ displayTag }) => displayTag).join(", ")})`;
		}
	}
	// endregion

	return out;
};

Parser.monTypeToFullObj._getTagMetas = (tags) => {
	return tags
		? tags.map(tag => {
			if (typeof tag === "string") { // handles e.g. "Fiend (Devil)"
				return {
					filterTag: tag.toLowerCase(),
					displayTag: Parser.MON_TAG_TO_CN[tag.toLowerCase()] || tag.toTitleCase(),
				};
			} else { // handles e.g. "Humanoid (Chondathan Human)"
				return {
					filterTag: tag.tag.toLowerCase(),
					displayTag: `${Parser.MON_TAG_PREFIX_TO_CN[tag.prefix.toLowerCase()] || tag.prefix}${Parser.MON_TAG_TO_CN[tag.tag.toLowerCase()] || tag.tag}`.toTitleCase(),
				};
			}
		})
		: [];
};

Parser.monTypeToPlural = function (type) {
	return Parser._parse_aToB(Parser.MON_TYPE_TO_PLURAL, type);
};

Parser.monTypeFromPlural = function (type) {
	return Parser._parse_bToA(Parser.MON_TYPE_TO_PLURAL, type);
};

Parser.monCrToFull = function (cr, {xp = null, isMythic = false} = {}) {
	if (cr == null) return "";

	if (typeof cr === "string") {
		if (Parser.crToNumber(cr) >= VeCt.CR_CUSTOM) return `${cr}${xp != null ? ` (${xp} XP)` : ""}`;

		xp = xp != null ? Parser._addCommas(xp) : Parser.crToXp(cr);
		return `${cr} (${xp} XP${isMythic ? `, or ${Parser.crToXp(cr, {isDouble: true})} XP as a mythic encounter` : ""})`;
	} else {
		const stack = [Parser.monCrToFull(cr.cr, {xp: cr.xp, isMythic})];
		if (cr.lair) stack.push(`${Parser.monCrToFull(cr.lair)} when encountered in lair`);
		if (cr.coven) stack.push(`${Parser.monCrToFull(cr.coven)} when part of a coven`);
		return stack.joinConjunct(", ", " or ");
	}
};

Parser.getFullImmRes = function (toParse, {isPlainText = false, isTitleCase = false} = {}) {
	if (!toParse?.length) return "";

	let maxDepth = 0;

	const renderString = (str, {isTitleCase = false} = {}) => {
		if (isTitleCase) str = str.toTitleCase();
		return isPlainText ? Renderer.stripTags(`${str}`) : Renderer.get().render(`${str}`);
	};

	const render = (val, depth = 0) => {
		maxDepth = Math.max(maxDepth, depth);
		if (typeof val === "string") return renderString(val, {isTitleCase});

		if (val.special) return renderString(val.special);

		const stack = [];

		if (val.preNote) stack.push(renderString(val.preNote));

		const prop = val.immune ? "immune" : val.resist ? "resist" : val.vulnerable ? "vulnerable" : null;
		if (prop) {
			const toJoin = val[prop].length === Parser.DMG_TYPES.length && CollectionUtil.deepEquals(Parser.DMG_TYPES, val[prop])
				? ["all damage"[isTitleCase ? "toTitleCase" : "toString"]()]
				: val[prop].map(nxt => render(nxt, depth + 1));
			stack.push(renderString(depth ? toJoin.join(maxDepth ? "; " : ", ") : toJoin.joinConjunct(", ", " 和 ")));
		}

		if (val.note) stack.push(renderString(val.note));

		return stack.join(" ");
	};

	const arr = toParse.map(it => render(it));

	if (arr.length <= 1) return arr.join("");

	let out = "";
	for (let i = 0; i < arr.length - 1; ++i) {
		const it = arr[i];
		const nxt = arr[i + 1];

		const orig = toParse[i];
		const origNxt = toParse[i + 1];

		out += it;
		out += (it.includes(",") || nxt.includes(",") || (orig && orig.cond) || (origNxt && origNxt.cond)) ? "; " : ", ";
	}
	out += arr.last();
	return out;
};

Parser.getFullCondImm = function (condImm, {isPlainText = false, isEntry = false, isTitleCase = false} = {}) {
	if (isPlainText && isEntry) throw new Error(`Options "isPlainText" and "isEntry" are mutually exclusive!`);

	if (!condImm?.length) return "";

	const render = condition => {
		if (isTitleCase) condition = condition.toTitleCase();
		if (isPlainText) return condition;
		const ent = `{@condition ${condition}}`;
		if (isEntry) return ent;
		return Renderer.get().render(ent);
	};

	return condImm
		.map(it => {
			if (it.special) return Renderer.get().render(it.special);
			if (it.conditionImmune) return `${it.preNote ? `${it.preNote} ` : ""}${it.conditionImmune.map(render).join(", ")}${it.note ? ` ${it.note}` : ""}`;
			return render(it);
		})
		.sort(SortUtil.ascSortLower).join(", ");
};

Parser.MON_SENSE_TAG_TO_FULL = {
	"B": "盲视",
	"D": "黑暗视觉",
	"SD": "高级黑暗视觉",
	"T": "震颤感知",
	"U": "真实视觉",
};
Parser.monSenseTagToFull = function (tag) {
	return Parser._parse_aToB(Parser.MON_SENSE_TAG_TO_FULL, tag);
};

Parser.MON_SPELLCASTING_TAG_TO_FULL = {
	"P": "灵能",
	"I": "天生",
	"F": "限定型态",
	"S": "共享",
	"O": "其他",
	"CA": "职业，奇械师",
	"CB": "职业，吟游诗人",
	"CC": "职业，牧师",
	"CD": "职业，德鲁伊",
	"CP": "职业，圣武士",
	"CR": "职业，游侠",
	"CS": "职业，术士",
	"CL": "职业，契术师",
	"CW": "职业，法师",
};
Parser.monSpellcastingTagToFull = function (tag) {
	return Parser._parse_aToB(Parser.MON_SPELLCASTING_TAG_TO_FULL, tag);
};

Parser.MON_MISC_TAG_TO_FULL = {
	"AOE": "Has Areas of Effect",
	"CUR": "Inflicts Curse",
	"DIS": "Inflicts Disease",
	"HPR": "Has HP Reduction",
	"MW": "Has Weapon Attacks, Melee",
	"RW": "Has Weapon Attacks, Ranged",
	"MA": "Has Attacks, Melee",
	"RA": "Has Attacks, Ranged",
	"MLW": "Has Melee Weapons",
	"RNG": "Has Ranged Weapons",
	"RCH": "Has Reach Attacks",
	"THW": "Has Thrown Weapons",
};
Parser.monMiscTagToFull = function (tag) {
	return Parser._parse_aToB(Parser.MON_MISC_TAG_TO_FULL, tag);
};

Parser.MON_LANGUAGE_TAG_TO_FULL = {
	"AB": "Abyssal",
	"AQ": "Aquan",
	"AU": "Auran",
	"C": "Common",
	"CE": "Celestial",
	"CS": "不能说已知语言",
	"D": "Dwarvish",
	"DR": "Draconic",
	"DS": "Deep Speech",
	"DU": "Druidic",
	"E": "Elvish",
	"G": "Gnomish",
	"GI": "Giant",
	"GO": "Goblin",
	"GTH": "Gith",
	"H": "Halfling",
	"I": "Infernal",
	"IG": "Ignan",
	"LF": "生前所知的语言",
	"O": "Orc",
	"OTH": "Other",
	"P": "Primordial",
	"S": "Sylvan",
	"T": "Terran",
	"TC": "Thieves' cant",
	"TP": "心灵感应",
	"U": "Undercommon",
	"X": "任意(自选)",
	"XX": "全部",
};
Parser.monLanguageTagToFull = function (tag) {
	return Parser._parse_aToB(Parser.LANGUAGES_TO_CN, Parser._parse_aToB(Parser.MON_LANGUAGE_TAG_TO_FULL, tag).toLowerCase());
};

Parser.ENVIRONMENTS = ["arctic", "coastal", "desert", "forest", "grassland", "hill", "mountain", "swamp", "underdark", "underwater", "urban"];

// psi-prefix functions are for parsing psionic data, and shared with the roll20 script
Parser.PSI_ABV_TYPE_TALENT = "T";
Parser.PSI_ABV_TYPE_DISCIPLINE = "D";
Parser.PSI_ORDER_NONE = "None";
Parser.psiTypeToFull = type => Parser.psiTypeToMeta(type).full;

Parser.psiTypeToMeta = type => {
	let out = {};
	if (type === Parser.PSI_ABV_TYPE_TALENT) out = {hasOrder: false, full: "Talent"};
	else if (type === Parser.PSI_ABV_TYPE_DISCIPLINE) out = {hasOrder: true, full: "Discipline"};
	else if (PrereleaseUtil.getMetaLookup("psionicTypes")?.[type]) out = MiscUtil.copyFast(PrereleaseUtil.getMetaLookup("psionicTypes")[type]);
	else if (BrewUtil2.getMetaLookup("psionicTypes")?.[type]) out = MiscUtil.copyFast(BrewUtil2.getMetaLookup("psionicTypes")[type]);
	out.full = out.full || "Unknown";
	out.short = out.short || out.full;
	return out;
};

Parser.psiOrderToFull = (order) => {
	return order === undefined ? Parser.PSI_ORDER_NONE : order;
};

Parser.prereqSpellToFull = function (spell, { isTextOnly = false } = {}) {
	if (spell) {
		const [text, suffix] = spell.split("#");
		if (!suffix) return isTextOnly ? spell : Renderer.get().render(`{@spell ${spell}}`);
		else if (suffix === "c") return (isTextOnly ? Renderer.stripTags : Renderer.get().render.bind(Renderer.get()))(`{@spell ${text}} 戏法`);
		else if (suffix === "x") return (isTextOnly ? Renderer.stripTags : Renderer.get().render.bind(Renderer.get()))("{@spell hex} 法术 或 能施加诅咒的契术师能力");
	} else return VeCt.STR_NONE;
};

Parser.prereqPactToFull = function (pact) {
	if (pact === "Chain") return "锁链魔契";
	if (pact === "Tome") return "书卷魔契";
	if (pact === "Blade") return "锋刃魔契";
	if (pact === "Talisman") return "符之魔契";
	return pact;
};

Parser.prereqPatronToShort = function (patron) {
	if (patron === "Any") return patron;
	const mThe = /^The (.*?)$/.exec(patron);
	if (mThe) return mThe[1];
	return patron;
};

Parser.FEAT_CATEGORY_TO_FULL = {
	"G": "通用",
	"O": "起源",
	"FS": "战斗风格",
	"FS:P": "可选战斗风格 (圣武士)",
	"FS:R": "可选战斗风格 (游侠)",
	"EB": "传奇恩惠",
};

Parser.featCategoryToFull = (category) => {
	return Parser._parse_aToB(Parser.FEAT_CATEGORY_TO_FULL, category) || category;
};

Parser.featCategoryFromFull = (full) => {
	return Parser._parse_bToA(Parser.FEAT_CATEGORY_TO_FULL, full.trim().toTitleCase()) || full;
};

// NOTE: These need to be reflected in omnidexer.js to be indexed
Parser.OPT_FEATURE_TYPE_TO_FULL = {
	AI: "Artificer Infusion",
	ED: "Elemental Discipline",
	EI: "Eldritch Invocation",
	MM: "Metamagic",
	"MV": "Maneuver",
	"MV:B": "Maneuver, Battle Master",
	"MV:C2-UA": "Maneuver, Cavalier V2 (UA)",
	"AS:V1-UA": "Arcane Shot, V1 (UA)",
	"AS:V2-UA": "Arcane Shot, V2 (UA)",
	"AS": "Arcane Shot",
	OTH: "Other",
	"FS:F": "Fighting Style; Fighter",
	"FS:B": "Fighting Style; Bard",
	"FS:P": "Fighting Style; Paladin",
	"FS:R": "Fighting Style; Ranger",
	"PB": "Pact Boon",
	"OR": "Onomancy Resonant",
	"RN": "符文骑士符文",
	"AF": "Alchemical Formula",
	"TT": "Traveler's Trick",
};

Parser.optFeatureTypeToFull = function (type) {
	if (Parser.OPT_FEATURE_TYPE_TO_FULL[type]) return Parser.OPT_FEATURE_TYPE_TO_FULL[type];
	if (PrereleaseUtil.getMetaLookup("optionalFeatureTypes")?.[type]) return PrereleaseUtil.getMetaLookup("optionalFeatureTypes")[type];
	if (BrewUtil2.getMetaLookup("optionalFeatureTypes")?.[type]) return BrewUtil2.getMetaLookup("optionalFeatureTypes")[type];
	return type;
};

Parser.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL = {
	"SG": "Supernatural Gift",
	"OF": "Optional Feature",
	"DG": "Dark Gift",
	"RF:B": "Replacement Feature: Background",
	"CS": "Character Secret", // Specific to IDRotF (rules on page 14)
};

Parser.charCreationOptionTypeToFull = function (type) {
	if (Parser.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL[type]) return Parser.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL[type];
	if (PrereleaseUtil.getMetaLookup("charOption")?.[type]) return PrereleaseUtil.getMetaLookup("charOption")[type];
	if (BrewUtil2.getMetaLookup("charOption")?.[type]) return BrewUtil2.getMetaLookup("charOption")[type];
	return type;
};

Parser._ALIGNMENT_ABV_TO_FULL = {
	"L": "守序",
	"N": "中立",
	"NX": "中立(守序/混乱轴)",
	"NY": "中立(善良/邪恶轴)",
	"C": "混乱",
	"G": "善良",
	"E": "邪恶",
	// "special" values
	"U": "无阵营",
	"A": "任意阵营",
};

Parser.alignmentAbvToFull = function (alignment) {
	if (!alignment) return null; // used in sidekicks

	if (typeof alignment === "object") {
		// use in MTF Sacred Statue
		if (alignment.special != null) return alignment.special;

		// e.g. `{alignment: ["N", "G"], chance: 50}` or `{alignment: ["N", "G"]}`
		return `${Parser.alignmentListToFull(alignment.alignment)}${alignment.chance ? ` (${alignment.chance}%)` : ""}${alignment.note ? ` (${alignment.note})` : ""}`;
	}

	alignment = alignment.toUpperCase();
	return Parser._ALIGNMENT_ABV_TO_FULL[alignment] ?? alignment;
};

Parser.alignmentListToFull = function (alignList) {
	if (!alignList) return "";

	if (alignList.some(it => typeof it !== "string")) {
		if (alignList.some(it => typeof it === "string")) throw new Error(`Mixed alignment types: ${JSON.stringify(alignList)}`);

		// filter out any nonexistent alignments, as we don't care about "alignment does not exist" if there are other alignments
		return alignList
			.filter(it => it.alignment === undefined || it.alignment != null)
			.map(it => it.special != null || it.chance != null || it.note != null ? Parser.alignmentAbvToFull(it) : Parser.alignmentListToFull(it.alignment)).join(" or ");
	}

	// assume all single-length arrays can be simply parsed
	if (alignList.length === 1) return Parser.alignmentAbvToFull(alignList[0]);
	// a pair of abv's, e.g. "L" "G"
	if (alignList.length === 2) {
		return alignList.map(a => Parser.alignmentAbvToFull(a)).join(" ");
	}
	if (alignList.length === 3) {
		if (alignList.includes("NX") && alignList.includes("NY") && alignList.includes("N")) return "any neutral alignment";
	}
	// longer arrays should have a custom mapping
	if (alignList.length === 5) {
		if (!alignList.includes("G")) return "任意非善良阵营";
		if (!alignList.includes("E")) return "任意非邪恶阵营";
		if (!alignList.includes("L")) return "任意非守序阵营";
		if (!alignList.includes("C")) return "任意非混乱阵营";
	}
	if (alignList.length === 4) {
		if (!alignList.includes("L") && !alignList.includes("NX")) return "任意混乱阵营";
		if (!alignList.includes("G") && !alignList.includes("NY")) return "任意邪恶阵营";
		if (!alignList.includes("C") && !alignList.includes("NX")) return "任意守序阵营";
		if (!alignList.includes("E") && !alignList.includes("NY")) return "任意善良阵营";
	}
	throw new Error(`Unmapped alignment: ${JSON.stringify(alignList)}`);
};

Parser.weightToFull = function (lbs, isSmallUnit) {
	const tons = Math.floor(lbs / 2000);
	lbs = lbs - (2000 * tons);
	return [
		tons ? `${tons}${isSmallUnit ? `<span class="ve-small ml-1">` : " "}吨${tons === 1 ? "" : "s"}${isSmallUnit ? `</span>` : ""}` : null,
		lbs ? `${lbs}${isSmallUnit ? `<span class="ve-small ml-1">` : " "}磅${isSmallUnit ? `</span>` : ""}` : null,
	].filter(Boolean).join(", ");
};

Parser.RARITIES = ["common", "uncommon", "rare", "very rare", "legendary", "artifact"];
Parser.ITEM_RARITIES = ["none", ...Parser.RARITIES, "varies", "unknown", "unknown (magic)", "other"];
Parser.RARITIES_TO_CN = {
	"none": "无",
	"common": "常见",
	"uncommon": "不常见",
	"rare": "珍稀",
	"very rare": "非常珍惜",
	"legendary": "传说",
	"artifact": "神器",
	"varies": "多种",
	"unknown": "不明",
	"unknown (magic)": "不明(魔法)",
	"other": "其他"
};

Parser.CAT_ID_CREATURE = 1;
Parser.CAT_ID_SPELL = 2;
Parser.CAT_ID_BACKGROUND = 3;
Parser.CAT_ID_ITEM = 4;
Parser.CAT_ID_CLASS = 5;
Parser.CAT_ID_CONDITION = 6;
Parser.CAT_ID_FEAT = 7;
Parser.CAT_ID_ELDRITCH_INVOCATION = 8;
Parser.CAT_ID_PSIONIC = 9;
Parser.CAT_ID_RACE = 10;
Parser.CAT_ID_OTHER_REWARD = 11;
Parser.CAT_ID_VARIANT_OPTIONAL_RULE = 12;
Parser.CAT_ID_ADVENTURE = 13;
Parser.CAT_ID_DEITY = 14;
Parser.CAT_ID_OBJECT = 15;
Parser.CAT_ID_TRAP = 16;
Parser.CAT_ID_HAZARD = 17;
Parser.CAT_ID_QUICKREF = 18;
Parser.CAT_ID_CULT = 19;
Parser.CAT_ID_BOON = 20;
Parser.CAT_ID_DISEASE = 21;
Parser.CAT_ID_METAMAGIC = 22;
Parser.CAT_ID_MANEUVER_BATTLEMASTER = 23;
Parser.CAT_ID_TABLE = 24;
Parser.CAT_ID_TABLE_GROUP = 25;
Parser.CAT_ID_MANEUVER_CAVALIER = 26;
Parser.CAT_ID_ARCANE_SHOT = 27;
Parser.CAT_ID_OPTIONAL_FEATURE_OTHER = 28;
Parser.CAT_ID_FIGHTING_STYLE = 29;
Parser.CAT_ID_CLASS_FEATURE = 30;
Parser.CAT_ID_VEHICLE = 31;
Parser.CAT_ID_PACT_BOON = 32;
Parser.CAT_ID_ELEMENTAL_DISCIPLINE = 33;
Parser.CAT_ID_ARTIFICER_INFUSION = 34;
Parser.CAT_ID_SHIP_UPGRADE = 35;
Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE = 36;
Parser.CAT_ID_ONOMANCY_RESONANT = 37;
Parser.CAT_ID_RUNE_KNIGHT_RUNE = 37;
Parser.CAT_ID_ALCHEMICAL_FORMULA = 38;
Parser.CAT_ID_MANEUVER = 39;
Parser.CAT_ID_SUBCLASS = 40;
Parser.CAT_ID_SUBCLASS_FEATURE = 41;
Parser.CAT_ID_ACTION = 42;
Parser.CAT_ID_LANGUAGE = 43;
Parser.CAT_ID_BOOK = 44;
Parser.CAT_ID_PAGE = 45;
Parser.CAT_ID_LEGENDARY_GROUP = 46;
Parser.CAT_ID_CHAR_CREATION_OPTIONS = 47;
Parser.CAT_ID_RECIPES = 48;
Parser.CAT_ID_STATUS = 49;
Parser.CAT_ID_SKILLS = 50;
Parser.CAT_ID_SENSES = 51;
Parser.CAT_ID_DECK = 52;
Parser.CAT_ID_CARD = 53;
Parser.CAT_ID_ITEM_MASTERY = 54;

Parser.CAT_ID_TO_FULL = {};
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CREATURE] = "Bestiary";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SPELL] = "Spell";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BACKGROUND] = "Background";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ITEM] = "Item";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CLASS] = "Class";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CONDITION] = "Condition";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FEAT] = "Feat";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ELDRITCH_INVOCATION] = "Eldritch Invocation";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PSIONIC] = "Psionic";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RACE] = "Race";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OTHER_REWARD] = "Other Reward";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] = "Variant/Optional Rule";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ADVENTURE] = "Adventure";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DEITY] = "Deity";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OBJECT] = "Object";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TRAP] = "Trap";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_HAZARD] = "Hazard";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_QUICKREF] = "Quick Reference";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CULT] = "Cult";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BOON] = "Boon";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DISEASE] = "Disease";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_METAMAGIC] = "Metamagic";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER_BATTLEMASTER] = "Maneuver; Battlemaster";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TABLE] = "Table";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TABLE_GROUP] = "Table";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER_CAVALIER] = "Maneuver; Cavalier";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ARCANE_SHOT] = "Arcane Shot";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] = "Optional Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FIGHTING_STYLE] = "Fighting Style";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CLASS_FEATURE] = "Class Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VEHICLE] = "Vehicle";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PACT_BOON] = "Pact Boon";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] = "Elemental Discipline";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ARTIFICER_INFUSION] = "Infusion";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SHIP_UPGRADE] = "Ship Upgrade";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] = "Infernal War Machine Upgrade";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ONOMANCY_RESONANT] = "Onomancy Resonant";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = "Rune Knight Rune";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ALCHEMICAL_FORMULA] = "Alchemical Formula";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER] = "Maneuver";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBCLASS] = "Subclass";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBCLASS_FEATURE] = "Subclass Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ACTION] = "Action";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_LANGUAGE] = "Language";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BOOK] = "Book";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PAGE] = "Page";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_LEGENDARY_GROUP] = "Legendary Group";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CHAR_CREATION_OPTIONS] = "Character Creation Option";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RECIPES] = "Recipe";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_STATUS] = "Status";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DECK] = "Deck";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CARD] = "Card";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SKILLS] = "Skill";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SENSES] = "Sense";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ITEM_MASTERY] = "Item Mastery";

Parser.pageCategoryToFull = function (catId) {
	return Parser._parse_aToB(Parser.CAT_ID_TO_FULL, catId);
};

Parser.CAT_ID_TO_PROP = {};
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CREATURE] = "monster";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SPELL] = "spell";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BACKGROUND] = "background";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ITEM] = "item";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CLASS] = "class";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CONDITION] = "condition";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FEAT] = "feat";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PSIONIC] = "psionic";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RACE] = "race";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OTHER_REWARD] = "reward";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] = "variantrule";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ADVENTURE] = "adventure";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DEITY] = "deity";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OBJECT] = "object";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TRAP] = "trap";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_HAZARD] = "hazard";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CULT] = "cult";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BOON] = "boon";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DISEASE] = "condition";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TABLE] = "table";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TABLE_GROUP] = "tableGroup";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VEHICLE] = "vehicle";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ELDRITCH_INVOCATION] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER_CAVALIER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ARCANE_SHOT] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FIGHTING_STYLE] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_METAMAGIC] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER_BATTLEMASTER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PACT_BOON] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ARTIFICER_INFUSION] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SHIP_UPGRADE] = "vehicleUpgrade";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] = "vehicleUpgrade";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ONOMANCY_RESONANT] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ALCHEMICAL_FORMULA] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_QUICKREF] = null;
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CLASS_FEATURE] = "classFeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBCLASS] = "subclass";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBCLASS_FEATURE] = "subclassFeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ACTION] = "action";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_LANGUAGE] = "language";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BOOK] = "book";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PAGE] = null;
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_LEGENDARY_GROUP] = "legendaryGroup";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CHAR_CREATION_OPTIONS] = "charoption";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RECIPES] = "recipe";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_STATUS] = "status";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DECK] = "deck";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CARD] = "card";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SKILLS] = "skill";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SENSES] = "sense";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ITEM_MASTERY] = "itemMastery";

Parser.pageCategoryToProp = function (catId) {
	return Parser._parse_aToB(Parser.CAT_ID_TO_PROP, catId);
};

Parser.ABIL_ABVS = ["str", "dex", "con", "int", "wis", "cha"];

Parser.spClassesToCurrentAndLegacy = function (fromClassList) {
	const current = [];
	const legacy = [];
	fromClassList.forEach(cls => {
		if ((cls.name === "Artificer" && cls.source === "UAArtificer") || (cls.name === "Artificer (Revisited)" && cls.source === "UAArtificerRevisited")) legacy.push(cls);
		else current.push(cls);
	});
	return [current, legacy];
};

/**
 * Build a pair of strings; one with all current subclasses, one with all legacy subclasses
 *
 * @param sp a spell
 * @param subclassLookup Data loaded from `generated/gendata-subclass-lookup.json`. Of the form: `{PHB: {Barbarian: {PHB: {Berserker: "Path of the Berserker"}}}}`
 * @returns {*[]} A two-element array. First item is a string of all the current subclasses, second item a string of
 * all the legacy/superseded subclasses
 */
Parser.spSubclassesToCurrentAndLegacyFull = function (sp, subclassLookup) {
	return Parser._spSubclassesToCurrentAndLegacyFull({sp, subclassLookup, prop: "fromSubclass"});
};

Parser.spVariantSubclassesToCurrentAndLegacyFull = function (sp, subclassLookup) {
	return Parser._spSubclassesToCurrentAndLegacyFull({sp, subclassLookup, prop: "fromSubclassVariant"});
};

Parser._spSubclassesToCurrentAndLegacyFull = ({sp, subclassLookup, prop}) => {
	const fromSubclass = Renderer.spell.getCombinedClasses(sp, prop);
	if (!fromSubclass.length) return ["", ""];

	const current = [];
	const legacy = [];
	const curNames = new Set();
	const toCheck = [];
	fromSubclass
		.filter(c => {
			const excludeClass = ExcludeUtil.isExcluded(
				UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({name: c.class.name, source: c.class.source}),
				"class",
				c.class.source,
				{isNoCount: true},
			);
			if (excludeClass) return false;

			const excludeSubclass = ExcludeUtil.isExcluded(
				UrlUtil.URL_TO_HASH_BUILDER["subclass"]({
					shortName: c.subclass.shortName,
					source: c.subclass.source,
					className: c.class.name,
					classSource: c.class.source,
				}),
				"subclass",
				c.subclass.source,
				{isNoCount: true},
			);
			if (excludeSubclass) return false;

			return !Renderer.spell.isExcludedSubclassVariantSource({classDefinedInSource: c.class.definedInSource});
		})
		.sort((a, b) => {
			const byName = SortUtil.ascSort(a.subclass.name, b.subclass.name);
			return byName || SortUtil.ascSort(a.class.name, b.class.name);
		})
		.forEach(c => {
			const nm = c.subclass.name;
			const src = c.subclass.source;

			const toAdd = Parser._spSubclassItem({fromSubclass: c, isTextOnly: false});

			const fromLookup = MiscUtil.get(
				subclassLookup,
				c.class.source,
				c.class.name,
				c.subclass.source,
				c.subclass.name,
			);

			if (fromLookup && fromLookup.isReprinted) {
				legacy.push(toAdd);
			} else if (SourceUtil.isNonstandardSource(src)) {
				const cleanName = Parser._spSubclassesToCurrentAndLegacyFull.mapClassShortNameToMostRecent(
					nm.split("(")[0].trim().split(/v\d+/)[0].trim(),
				);
				toCheck.push({"name": cleanName, "ele": toAdd});
			} else {
				current.push(toAdd);
				curNames.add(nm);
			}
		});

	toCheck.forEach(n => {
		if (curNames.has(n.name)) {
			legacy.push(n.ele);
		} else {
			current.push(n.ele);
		}
	});

	return [current.join(", "), legacy.join(", ")];
};

/**
 * Get the most recent iteration of a subclass name.
 */
Parser._spSubclassesToCurrentAndLegacyFull.mapClassShortNameToMostRecent = (shortName) => {
	switch (shortName) {
		case "Favored Soul": return "Divine Soul";
		case "Undying Light": return "Celestial";
		case "Deep Stalker": return "Gloom Stalker";
	}
	return shortName;
};

Parser.spVariantClassesToCurrentAndLegacy = function (fromVariantClassList) {
	const current = [];
	const legacy = [];
	fromVariantClassList.forEach(cls => {
		if (SourceUtil.isPrereleaseSource(cls.definedInSource)) legacy.push(cls);
		else current.push(cls);
	});
	return [current, legacy];
};

Parser.attackTypeToFull = function (attackType) {
	return Parser._parse_aToB(Parser.ATK_TYPE_TO_FULL, attackType);
};

Parser.trapHazTypeToFull = function (type) {
	return Parser._parse_aToB(Parser.TRAP_HAZARD_TYPE_TO_FULL, type);
};

Parser.TRAP_HAZARD_TYPE_TO_FULL = {
	MECH: "机械陷阱",
	MAG: "魔法陷阱",
	SMPL: "简易陷阱",
	CMPX: "复杂陷阱",
	HAZ: "危害物",
	WTH: "天气",
	ENV: "环境危害",
	WLD: "野外危害",
	GEN: "通用",
	EST: "奥法风暴",
};

Parser.tierToFullLevel = function (tier) {
	return Parser._parse_aToB(Parser.TIER_TO_FULL_LEVEL, tier);
};

Parser.TIER_TO_FULL_LEVEL = {};
Parser.TIER_TO_FULL_LEVEL[1] = "1st\u20134th Level";
Parser.TIER_TO_FULL_LEVEL[2] = "5th\u201310th Level";
Parser.TIER_TO_FULL_LEVEL[3] = "11th\u201316th Level";
Parser.TIER_TO_FULL_LEVEL[4] = "17th\u201320th Level";

Parser.trapInitToFull = function (init) {
	return Parser._parse_aToB(Parser.TRAP_INIT_TO_FULL, init);
};

Parser.TRAP_INIT_TO_FULL = {};
Parser.TRAP_INIT_TO_FULL[1] = "先攻顺序10";
Parser.TRAP_INIT_TO_FULL[2] = "先攻顺序20";
Parser.TRAP_INIT_TO_FULL[3] = "先攻顺序20 和 先攻顺序10";

Parser.ATK_TYPE_TO_FULL = {};
Parser.ATK_TYPE_TO_FULL["MW"] = "近战武器攻击";
Parser.ATK_TYPE_TO_FULL["RW"] = "远程武器攻击";

Parser.bookOrdinalToAbv = (ordinal, preNoSuff) => {
	if (ordinal === undefined) return "";
	switch (ordinal.type) {
		case "part": return `${preNoSuff ? " " : ""}Part ${ordinal.identifier}${preNoSuff ? "" : " \u2014 "}`;
		case "chapter": return `${preNoSuff ? " " : ""}Ch. ${ordinal.identifier}${preNoSuff ? "" : ": "}`;
		case "episode": return `${preNoSuff ? " " : ""}Ep. ${ordinal.identifier}${preNoSuff ? "" : ": "}`;
		case "appendix": return `${preNoSuff ? " " : ""}App.${ordinal.identifier != null ? ` ${ordinal.identifier}` : ""}${preNoSuff ? "" : ": "}`;
		case "level": return `${preNoSuff ? " " : ""}Level ${ordinal.identifier}${preNoSuff ? "" : ": "}`;
		default: throw new Error(`Unhandled ordinal type "${ordinal.type}"`);
	}
};

Parser.IMAGE_TYPE_TO_FULL = {
	"map": "Map",
	"mapPlayer": "Map (Player)",
};
Parser.imageTypeToFull = function (imageType) {
	return Parser._parse_aToB(Parser.IMAGE_TYPE_TO_FULL, imageType, "Other");
};

Parser.nameToTokenName = function (name) {
	return name
		.toAscii()
		.replace(/"/g, "");
};

Parser.bytesToHumanReadable = function (bytes, {fixedDigits = 2} = {}) {
	if (bytes == null) return "";
	if (!bytes) return "0 B";
	const e = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / Math.pow(1024, e)).toFixed(fixedDigits)} ${`\u200bKMGTP`.charAt(e)}B`;
};

Parser.SKL_ABV_ABJ = "A";
Parser.SKL_ABV_EVO = "V";
Parser.SKL_ABV_ENC = "E";
Parser.SKL_ABV_ILL = "I";
Parser.SKL_ABV_DIV = "D";
Parser.SKL_ABV_NEC = "N";
Parser.SKL_ABV_TRA = "T";
Parser.SKL_ABV_CON = "C";
Parser.SKL_ABV_PSI = "P";
Parser.SKL_ABVS = [
	Parser.SKL_ABV_ABJ,
	Parser.SKL_ABV_CON,
	Parser.SKL_ABV_DIV,
	Parser.SKL_ABV_ENC,
	Parser.SKL_ABV_EVO,
	Parser.SKL_ABV_ILL,
	Parser.SKL_ABV_NEC,
	Parser.SKL_ABV_PSI,
	Parser.SKL_ABV_TRA,
];

Parser.SP_TM_ACTION = "action";
Parser.SP_TM_B_ACTION = "bonus";
Parser.SP_TM_REACTION = "reaction";
Parser.SP_TM_ROUND = "round";
Parser.SP_TM_MINS = "minute";
Parser.SP_TM_HRS = "hour";
Parser.SP_TM_SPECIAL = "special";
Parser.SP_TIME_SINGLETONS = [Parser.SP_TM_ACTION, Parser.SP_TM_B_ACTION, Parser.SP_TM_REACTION, Parser.SP_TM_ROUND];
Parser.SP_TIME_TO_FULL = {
	[Parser.SP_TM_ACTION]: "动作",
	[Parser.SP_TM_B_ACTION]: "附赠动作",
	[Parser.SP_TM_REACTION]: "反应",
	[Parser.SP_TM_ROUND]: "轮",
	[Parser.SP_TM_MINS]: "分钟",
	[Parser.SP_TM_HRS]: "小时",
	[Parser.SP_TM_SPECIAL]: "特殊",
};
Parser.spTimeUnitToFull = function (timeUnit) {
	return Parser._parse_aToB(Parser.SP_TIME_TO_FULL, timeUnit);
};

Parser.SP_TIME_TO_SHORT = {
	[Parser.SP_TM_ROUND]: "Rnd.",
	[Parser.SP_TM_MINS]: "Min.",
	[Parser.SP_TM_HRS]: "Hr.",
};
Parser.spTimeUnitToShort = function (timeUnit) {
	return Parser._parse_aToB(Parser.SP_TIME_TO_SHORT, timeUnit);
};

Parser.SP_TIME_TO_ABV = {
	[Parser.SP_TM_ACTION]: "A",
	[Parser.SP_TM_B_ACTION]: "BA",
	[Parser.SP_TM_REACTION]: "R",
	[Parser.SP_TM_ROUND]: "rnd",
	[Parser.SP_TM_MINS]: "min",
	[Parser.SP_TM_HRS]: "hr",
	[Parser.SP_TM_SPECIAL]: "SPC",
};
Parser.spTimeUnitToAbv = function (timeUnit) {
	return Parser._parse_aToB(Parser.SP_TIME_TO_ABV, timeUnit);
};

Parser.spTimeToShort = function (time, isHtml) {
	if (!time) return "";
	return (time.number === 1 && Parser.SP_TIME_SINGLETONS.includes(time.unit))
		? `${Parser.spTimeUnitToAbv(time.unit).uppercaseFirst()}${time.condition ? "*" : ""}`
		: `${time.number} ${isHtml ? `<span class="ve-small">` : ""}${Parser.spTimeUnitToAbv(time.unit)}${isHtml ? `</span>` : ""}${time.condition ? "*" : ""}`;
};

Parser.SKL_ABJ = "防护";
Parser.SKL_EVO = "塑能";
Parser.SKL_ENC = "惑控";
Parser.SKL_ILL = "幻术";
Parser.SKL_DIV = "预言";
Parser.SKL_NEC = "死灵";
Parser.SKL_TRA = "变化";
Parser.SKL_CON = "咒法";
Parser.SKL_PSI = "灵能";

Parser.SP_SCHOOL_ABV_TO_FULL = {};
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ABJ] = Parser.SKL_ABJ;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_EVO] = Parser.SKL_EVO;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ENC] = Parser.SKL_ENC;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ILL] = Parser.SKL_ILL;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_DIV] = Parser.SKL_DIV;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_NEC] = Parser.SKL_NEC;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_TRA] = Parser.SKL_TRA;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_CON] = Parser.SKL_CON;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_PSI] = Parser.SKL_PSI;

Parser.SP_SCHOOL_ABV_TO_SHORT = {};
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_ABJ] = "防护";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_EVO] = "塑能";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_ENC] = "惑控";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_ILL] = "幻术";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_DIV] = "预言";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_NEC] = "死灵";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_TRA] = "变化";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_CON] = "咒法";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_PSI] = "灵能";

Parser.ATB_ABV_TO_FULL = {
	"str": "力量",
	"dex": "敏捷",
	"con": "体质",
	"int": "智力",
	"wis": "感知",
	"cha": "魅力",
};

Parser.TP_ABERRATION = "aberration";
Parser.TP_BEAST = "beast";
Parser.TP_CELESTIAL = "celestial";
Parser.TP_CONSTRUCT = "construct";
Parser.TP_DRAGON = "dragon";
Parser.TP_ELEMENTAL = "elemental";
Parser.TP_FEY = "fey";
Parser.TP_FIEND = "fiend";
Parser.TP_GIANT = "giant";
Parser.TP_HUMANOID = "humanoid";
Parser.TP_MONSTROSITY = "monstrosity";
Parser.TP_OOZE = "ooze";
Parser.TP_PLANT = "plant";
Parser.TP_UNDEAD = "undead";
Parser.MON_TYPE_TO_PLURAL = {};
Parser.MON_TYPE_TO_PLURAL[Parser.TP_ABERRATION] = "异怪";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_BEAST] = "野兽";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_CELESTIAL] = "天界生物";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_CONSTRUCT] = "构装体";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_DRAGON] = "龙";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_ELEMENTAL] = "元素";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_FEY] = "精类";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_FIEND] = "邪魔";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_GIANT] = "巨人";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_HUMANOID] = "类人生物";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_MONSTROSITY] = "怪兽";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_OOZE] = "泥怪";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_PLANT] = "植物";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_UNDEAD] = "不死生物";
Parser.MON_EN_TYPES = [Parser.TP_ABERRATION, Parser.TP_BEAST, Parser.TP_CELESTIAL, Parser.TP_CONSTRUCT, Parser.TP_DRAGON, Parser.TP_ELEMENTAL, Parser.TP_FEY, Parser.TP_FIEND, Parser.TP_GIANT, Parser.TP_HUMANOID, Parser.TP_MONSTROSITY, Parser.TP_OOZE, Parser.TP_PLANT, Parser.TP_UNDEAD];
Parser.MON_TYPES = Parser.MON_EN_TYPES.map(it => Parser.MON_TYPE_TO_PLURAL[it] || it);

Parser.SZ_FINE = "F";
Parser.SZ_DIMINUTIVE = "D";
Parser.SZ_TINY = "T";
Parser.SZ_SMALL = "S";
Parser.SZ_MEDIUM = "M";
Parser.SZ_LARGE = "L";
Parser.SZ_HUGE = "H";
Parser.SZ_GARGANTUAN = "G";
Parser.SZ_COLOSSAL = "C";
Parser.SZ_VARIES = "V";
Parser.SIZE_ABVS = [Parser.SZ_TINY, Parser.SZ_SMALL, Parser.SZ_MEDIUM, Parser.SZ_LARGE, Parser.SZ_HUGE, Parser.SZ_GARGANTUAN, Parser.SZ_VARIES];
Parser.SIZE_ABV_TO_FULL = {};
Parser.SIZE_ABV_TO_FULL[Parser.SZ_FINE] = "Fine";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_DIMINUTIVE] = "Diminutive";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_TINY] = "微型";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_SMALL] = "小型";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_MEDIUM] = "中型";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_LARGE] = "大型";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_HUGE] = "巨型";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_GARGANTUAN] = "超巨型";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_COLOSSAL] = "Colossal";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_VARIES] = "不定";

Parser.XP_CHART_ALT = {
	"0": 10,
	"1/8": 25,
	"1/4": 50,
	"1/2": 100,
	"1": 200,
	"2": 450,
	"3": 700,
	"4": 1100,
	"5": 1800,
	"6": 2300,
	"7": 2900,
	"8": 3900,
	"9": 5000,
	"10": 5900,
	"11": 7200,
	"12": 8400,
	"13": 10000,
	"14": 11500,
	"15": 13000,
	"16": 15000,
	"17": 18000,
	"18": 20000,
	"19": 22000,
	"20": 25000,
	"21": 33000,
	"22": 41000,
	"23": 50000,
	"24": 62000,
	"25": 75000,
	"26": 90000,
	"27": 105000,
	"28": 120000,
	"29": 135000,
	"30": 155000,
};

Parser.ARMOR_ABV_TO_FULL = {
	"l.": "light",
	"m.": "medium",
	"h.": "heavy",
	"s.": "shield",
};

Parser.ARMOR_FULL_TO_CN = {
	"light": "轻",
	"medium": "中",
	"heavy": "重"
}

Parser.WEAPON_ABV_TO_FULL = {
	"s.": "简易",
	"m.": "军用",
};

Parser.CONDITION_TO_COLOR = {
	"Blinded": "#525252",
	"Charmed": "#f01789",
	"Deafened": "#ababab",
	"Exhausted": "#947a47",
	"Frightened": "#c9ca18",
	"Grappled": "#8784a0",
	"Incapacitated": "#3165a0",
	"Invisible": "#7ad2d6",
	"Paralyzed": "#c00900",
	"Petrified": "#a0a0a0",
	"Poisoned": "#4dc200",
	"Prone": "#5e60a0",
	"Restrained": "#d98000",
	"Stunned": "#a23bcb",
	"Unconscious": "#3a40ad",

	"Concentration": "#009f7a",
};

Parser.RULE_TYPE_TO_FULL = {
	"C": "Core",
	"O": "Optional",
	"P": "Prerelease",
	"V": "Variant",
	"VO": "Variant Optional",
	"VV": "Variant Variant",
	"U": "Unknown",
};

Parser.ruleTypeToFull = function (ruleType) {
	return Parser._parse_aToB(Parser.RULE_TYPE_TO_FULL, ruleType);
};

Parser.VEHICLE_TYPE_TO_FULL = {
	"SHIP": "Ship",
	"SPELLJAMMER": "Spelljammer Ship",
	"INFWAR": "Infernal War Machine",
	"CREATURE": "Creature",
	"OBJECT": "Object",
	"SHP:H": "Ship Upgrade, Hull",
	"SHP:M": "Ship Upgrade, Movement",
	"SHP:W": "Ship Upgrade, Weapon",
	"SHP:F": "Ship Upgrade, Figurehead",
	"SHP:O": "Ship Upgrade, Miscellaneous",
	"IWM:W": "Infernal War Machine Variant, Weapon",
	"IWM:A": "Infernal War Machine Upgrade, Armor",
	"IWM:G": "Infernal War Machine Upgrade, Gadget",
};

Parser.vehicleTypeToFull = function (vehicleType) {
	return Parser._parse_aToB(Parser.VEHICLE_TYPE_TO_FULL, vehicleType);
};

// SOURCES =============================================================================================================

Parser.SRC_5ETOOLS_TMP = "SRC_5ETOOLS_TMP"; // Temp source, used as a placeholder value

Parser.SRC_CoS = "CoS";
Parser.SRC_DMG = "DMG";
Parser.SRC_EEPC = "EEPC";
Parser.SRC_EET = "EET";
Parser.SRC_HotDQ = "HotDQ";
Parser.SRC_LMoP = "LMoP";
Parser.SRC_MM = "MM";
Parser.SRC_OotA = "OotA";
Parser.SRC_PHB = "PHB";
Parser.SRC_PotA = "PotA";
Parser.SRC_RoT = "RoT";
Parser.SRC_RoTOS = "RoTOS";
Parser.SRC_SCAG = "SCAG";
Parser.SRC_SKT = "SKT";
Parser.SRC_ToA = "ToA";
Parser.SRC_TLK = "TLK";
Parser.SRC_ToD = "ToD";
Parser.SRC_TTP = "TTP";
Parser.SRC_TYP = "TftYP";
Parser.SRC_TYP_AtG = "TftYP-AtG";
Parser.SRC_TYP_DiT = "TftYP-DiT";
Parser.SRC_TYP_TFoF = "TftYP-TFoF";
Parser.SRC_TYP_THSoT = "TftYP-THSoT";
Parser.SRC_TYP_TSC = "TftYP-TSC";
Parser.SRC_TYP_ToH = "TftYP-ToH";
Parser.SRC_TYP_WPM = "TftYP-WPM";
Parser.SRC_VGM = "VGM";
Parser.SRC_XGE = "XGE";
Parser.SRC_OGA = "OGA";
Parser.SRC_MTF = "MTF";
Parser.SRC_WDH = "WDH";
Parser.SRC_WDMM = "WDMM";
Parser.SRC_GGR = "GGR";
Parser.SRC_KKW = "KKW";
Parser.SRC_LLK = "LLK";
Parser.SRC_AZfyT = "AZfyT";
Parser.SRC_GoS = "GoS";
Parser.SRC_AI = "AI";
Parser.SRC_OoW = "OoW";
Parser.SRC_ESK = "ESK";
Parser.SRC_DIP = "DIP";
Parser.SRC_HftT = "HftT";
Parser.SRC_DC = "DC";
Parser.SRC_SLW = "SLW";
Parser.SRC_SDW = "SDW";
Parser.SRC_BGDIA = "BGDIA";
Parser.SRC_LR = "LR";
Parser.SRC_AL = "AL";
Parser.SRC_SAC = "SAC";
Parser.SRC_ERLW = "ERLW";
Parser.SRC_EFR = "EFR";
Parser.SRC_RMBRE = "RMBRE";
Parser.SRC_RMR = "RMR";
Parser.SRC_MFF = "MFF";
Parser.SRC_AWM = "AWM";
Parser.SRC_IMR = "IMR";
Parser.SRC_SADS = "SADS";
Parser.SRC_EGW = "EGW";
Parser.SRC_EGW_ToR = "ToR";
Parser.SRC_EGW_DD = "DD";
Parser.SRC_EGW_FS = "FS";
Parser.SRC_EGW_US = "US";
Parser.SRC_MOT = "MOT";
Parser.SRC_IDRotF = "IDRotF";
Parser.SRC_TCE = "TCE";
Parser.SRC_VRGR = "VRGR";
Parser.SRC_HoL = "HoL";
Parser.SRC_XMtS = "XMtS";
Parser.SRC_RtG = "RtG";
Parser.SRC_AitFR = "AitFR";
Parser.SRC_AitFR_ISF = "AitFR-ISF";
Parser.SRC_AitFR_THP = "AitFR-THP";
Parser.SRC_AitFR_AVT = "AitFR-AVT";
Parser.SRC_AitFR_DN = "AitFR-DN";
Parser.SRC_AitFR_FCD = "AitFR-FCD";
Parser.SRC_WBtW = "WBtW";
Parser.SRC_DoD = "DoD";
Parser.SRC_MaBJoV = "MaBJoV";
Parser.SRC_FTD = "FTD";
Parser.SRC_SCC = "SCC";
Parser.SRC_SCC_CK = "SCC-CK";
Parser.SRC_SCC_HfMT = "SCC-HfMT";
Parser.SRC_SCC_TMM = "SCC-TMM";
Parser.SRC_SCC_ARiR = "SCC-ARiR";
Parser.SRC_MPMM = "MPMM";
Parser.SRC_CRCotN = "CRCotN";
Parser.SRC_JttRC = "JttRC";
Parser.SRC_SAiS = "SAiS";
Parser.SRC_AAG = "AAG";
Parser.SRC_BAM = "BAM";
Parser.SRC_LoX = "LoX";
Parser.SRC_DoSI = "DoSI";
Parser.SRC_DSotDQ = "DSotDQ";
Parser.SRC_KftGV = "KftGV";
Parser.SRC_BGG = "BGG";
Parser.SRC_TDCSR = "TDCSR";
Parser.SRC_PaBTSO = "PaBTSO";
Parser.SRC_PAitM = "PAitM";
Parser.SRC_SatO = "SatO";
Parser.SRC_ToFW = "ToFW";
Parser.SRC_MPP = "MPP";
Parser.SRC_BMT = "BMT";
Parser.SRC_DMTCRG = "DMTCRG";
Parser.SRC_QftIS = "QftIS";
Parser.SRC_VEoR = "VEoR";
Parser.SRC_GHLoE = "GHLoE";
Parser.SRC_DoDk = "DoDk";
Parser.SRC_HWCS = "HWCS";
Parser.SRC_HWAitW = "HWAitW";
Parser.SRC_ToB1_2023 = "ToB1-2023";
Parser.SRC_XPHB = "XPHB";
Parser.SRC_XDMG = "XDMG";
Parser.SRC_XMM = "XMM";
Parser.SRC_TD = "TD";
Parser.SRC_SCREEN = "Screen";
Parser.SRC_SCREEN_WILDERNESS_KIT = "ScreenWildernessKit";
Parser.SRC_SCREEN_DUNGEON_KIT = "ScreenDungeonKit";
Parser.SRC_SCREEN_SPELLJAMMER = "ScreenSpelljammer";
Parser.SRC_HF = "HF";
Parser.SRC_HFFotM = "HFFotM";
Parser.SRC_HFStCM = "HFStCM";
Parser.SRC_PaF = "PaF";
Parser.SRC_CM = "CM";
Parser.SRC_NRH = "NRH";
Parser.SRC_NRH_TCMC = "NRH-TCMC";
Parser.SRC_NRH_AVitW = "NRH-AVitW";
Parser.SRC_NRH_ASS = "NRH-ASS"; // lmao
Parser.SRC_NRH_CoI = "NRH-CoI";
Parser.SRC_NRH_TLT = "NRH-TLT";
Parser.SRC_NRH_AWoL = "NRH-AWoL";
Parser.SRC_NRH_AT = "NRH-AT";
Parser.SRC_MGELFT = "MGELFT";
Parser.SRC_VD = "VD";
Parser.SRC_SjA = "SjA";
Parser.SRC_HAT_TG = "HAT-TG";
Parser.SRC_HAT_LMI = "HAT-LMI";
Parser.SRC_GotSF = "GotSF";
Parser.SRC_LK = "LK";
Parser.SRC_CoA = "CoA";
Parser.SRC_PiP = "PiP";
Parser.SRC_DitLCoT = "DitLCoT";
Parser.SRC_VNotEE = "VNotEE";
Parser.SRC_LRDT = "LRDT";
Parser.SRC_UtHftLH = "UtHftLH";

Parser.SRC_AL_PREFIX = "AL";

Parser.SRC_ALCoS = `${Parser.SRC_AL_PREFIX}CurseOfStrahd`;
Parser.SRC_ALEE = `${Parser.SRC_AL_PREFIX}ElementalEvil`;
Parser.SRC_ALRoD = `${Parser.SRC_AL_PREFIX}RageOfDemons`;

Parser.SRC_PS_PREFIX = "PS";

Parser.SRC_PSA = `${Parser.SRC_PS_PREFIX}A`;
Parser.SRC_PSI = `${Parser.SRC_PS_PREFIX}I`;
Parser.SRC_PSK = `${Parser.SRC_PS_PREFIX}K`;
Parser.SRC_PSZ = `${Parser.SRC_PS_PREFIX}Z`;
Parser.SRC_PSX = `${Parser.SRC_PS_PREFIX}X`;
Parser.SRC_PSD = `${Parser.SRC_PS_PREFIX}D`;

Parser.SRC_UA_PREFIX = "UA";
Parser.SRC_UA_ONE_PREFIX = "XUA";
Parser.SRC_MCVX_PREFIX = "MCV";
Parser.SRC_MisMVX_PREFIX = "MisMV";
Parser.SRC_AA_PREFIX = "AA";

Parser.SRC_UATMC = `${Parser.SRC_UA_PREFIX}TheMysticClass`;
Parser.SRC_MCV1SC = `${Parser.SRC_MCVX_PREFIX}1SC`;
Parser.SRC_MCV2DC = `${Parser.SRC_MCVX_PREFIX}2DC`;
Parser.SRC_MCV3MC = `${Parser.SRC_MCVX_PREFIX}3MC`;
Parser.SRC_MCV4EC = `${Parser.SRC_MCVX_PREFIX}4EC`;
Parser.SRC_MisMV1 = `${Parser.SRC_MisMVX_PREFIX}1`;
Parser.SRC_AATM = `${Parser.SRC_AA_PREFIX}TM`;

Parser.AL_PREFIX = "冒险者联盟：";
Parser.AL_PREFIX_SHORT = "AL: ";
Parser.PS_PREFIX = "异界传送系列：";
Parser.PS_PREFIX_SHORT = "PS: ";
Parser.UA_PREFIX = "破解奥秘：";
Parser.UA_PREFIX_SHORT = "UA: ";
Parser.TftYP_NAME = "哈欠门故事集";
Parser.AitFR_NAME = "Adventures in the Forgotten Realms";
Parser.NRH_NAME = "NERDS Restoring Harmony";
Parser.MCVX_PREFIX = "怪物纲要系列";
Parser.MisMVX_PREFIX = "错位怪物";
Parser.AA_PREFIX = "Adventure Atlas: ";

Parser.SOURCE_JSON_TO_FULL = {};
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CoS] = "施特拉德的诅咒";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DMG] = "地下城主指南";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EEPC] = "元素邪妄玩家扩展";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EET] = "邪恶元素小饰品";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HotDQ] = "龙后的宝山";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LMoP] = "凡戴尔的失落矿坑";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MM] = "怪物图鉴";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_OotA] = "逃离深渊";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PHB] = "玩家手册";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PotA] = "毁灭亲王";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RoT] = "提亚马特的崛起";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RoTOS] = "提亚马特的崛起 在线增刊";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCAG] = "剑湾冒险者指南";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SKT] = "风暴君王之雷霆";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ToA] = "湮灭之墓";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TLK] = "The Lost Kenku";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ToD] = "龙族暴政";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TTP] = "龟人扩充包";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP] = Parser.TftYP_NAME;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_AtG] = `${Parser.TftYP_NAME}: 挑战巨人`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_DiT] = `${Parser.TftYP_NAME}: 死于赛尔`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_TFoF] = `${Parser.TftYP_NAME}: 愤怒熔炉`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_THSoT] = `${Parser.TftYP_NAME}: 隐秘圣坛`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_TSC] = `${Parser.TftYP_NAME}: 暗无天日`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_ToH] = `${Parser.TftYP_NAME}: 恐怖墓穴`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_WPM] = `${Parser.TftYP_NAME}: 白羽山`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VGM] = "瓦罗的怪物指南";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_XGE] = "珊娜萨的万事指南";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_OGA] = "一蛙之上";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MTF] = "魔邓肯的众敌卷册";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_WDH] = "深水城：龙金飞劫";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_WDMM] = "深水城：疯法师的地下城";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GGR] = "拉尼卡的公会长指南";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_KKW] = "追捕克仑可";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LLK] = "夸力许的失落实验室";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AZfyT] = "给我你的思维瓶";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GoS] = "盐沼幽魂";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AI] = "艾奎兹玄有限责任公司";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_OoW] = "位面游荡仪";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ESK] = "起始";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DIP] = "冰塔峰之龙";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HftT] = "寻找特萨尔蛇蜥";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DC] = "神圣的争夺";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SLW] = "风暴领主之怒";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SDW] = "沉睡巨龙醒转";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BGDIA] = "博德之门：坠入阿弗纳斯";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LR] = "洛卡鱼人崛起";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AL] = "冒险者联盟";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SAC] = "智者建言手册";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ERLW] = "艾伯伦：从终末战争中崛起";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EFR] = "艾伯伦：失落的圣物";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RMBRE] = "瑞克与莫蒂：BRE";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RMR] = "龙与地下城 vs. 瑞克与莫蒂：基础规则";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MFF] = "魔邓肯邪魔开本";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AWM] = "Adventure with Muk";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_IMR] = "重建炼狱机器";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SADS] = "蓝宝石周年纪念骰套组";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW] = "荒洲探险家指南";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_ToR] = "复仇之潮";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_DD] = "危险计划";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_FS] = "封冻恶疾";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_US] = "恶客自来";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MOT] = "塞洛斯的神话奥德赛";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_IDRotF] = "冰风谷：冰霜少女的雾凇";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TCE] = "塔莎的万事坩埚";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VRGR] = "范·里希腾的鸦阁指南";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HoL] = "恸哭之屋";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RtG] = "Return to Glory";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR] = Parser.AitFR_NAME;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_ISF] = `${Parser.AitFR_NAME}: In Scarlet Flames`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_THP] = `${Parser.AitFR_NAME}: The Hidden Page`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_AVT] = `${Parser.AitFR_NAME}: A Verdant Tomb`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_DN] = `${Parser.AitFR_NAME}: Deepest Night`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_FCD] = `${Parser.AitFR_NAME}: From Cyan Depths`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_WBtW] = "巫光之外的荒野";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DoD] = "快乐领域";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MaBJoV] = "Minsc and Boo's Journal of Villainy";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_FTD] = "费资本的巨龙宝库";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC] = "斯翠海文：混沌研习";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_CK] = "校园风波";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_HfMT] = "追寻法师塔";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_TMM] = "院长的化妆舞会";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_ARiR] = "废墟中的审判";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MPMM] = "魔邓肯巨献：多元宇宙的怪物";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CRCotN] = "溟渊的呼唤";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_JttRC] = "耀光城之旅";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SAiS] = "魔法船：冒险，于太空之中";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AAG] = "星界冒险者指南";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BAM] = "布布的星界怪兽展";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LoX] = "萨里希斯之光";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DoSI] = "风骸岛之龙";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DSotDQ] = "龙枪：龙后之影";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_KftGV] = "黄金宝库之钥";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BGG] = "毕格比巨献：巨人之荣耀";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TDCSR] = "塔尔多雷战役设定集：重制版";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PaBTSO] = "凡戴尔之下：破碎方尖碑";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PAitM] = "异域风景：多元宇宙之冒险";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SatO] = "印记城与外域";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ToFW] = "命运之轮的轮转";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MPP] = "莫提的位面游记";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BMT] = "万象无常书";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DMTCRG] = "The Deck of Many Things: Card Reference Guide";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_QftIS] = "来自无尽阶梯的委托集";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VEoR] = "维克那：毁灭前夜";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GHLoE] = "Grim Hollow: Lairs of Etharis";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DoDk] = "Dungeons of Drakkenheim";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HWCS] = "Humblewood Campaign Setting";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HWAitW] = "Humblewood: Adventure in the Wood";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ToB1_2023] = "Tome of Beasts 1 (2023 Edition)";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_XPHB] = "玩家手册(2024)";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_XDMG] = "地下城城主指南(2024)";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_XMM] = "怪物图鉴(2024)";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TD] = "Tarot Deck";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN] = "Dungeon Master's Screen";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN_WILDERNESS_KIT] = "Dungeon Master's Screen: Wilderness Kit";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN_DUNGEON_KIT] = "Dungeon Master's Screen: Dungeon Kit";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN_SPELLJAMMER] = "Dungeon Master's Screen: Spelljammer";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HF] = "英雄盛宴";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HFFotM] = "Heroes' Feast: Flavors of the Multiverse";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HFStCM] = "英雄盛宴：救救孩子的菜谱";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PaF] = "Puncheons and Flagons";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CM] = "烛堡秘辛";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH] = Parser.NRH_NAME;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_TCMC] = `${Parser.NRH_NAME}: The Candy Mountain Caper`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_AVitW] = `${Parser.NRH_NAME}: A Voice in the Wilderness`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_ASS] = `${Parser.NRH_NAME}: A Sticky Situation`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_CoI] = `${Parser.NRH_NAME}: Circus of Illusions`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_TLT] = `${Parser.NRH_NAME}: The Lost Tomb`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_AWoL] = `${Parser.NRH_NAME}: A Web of Lies`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_AT] = `${Parser.NRH_NAME}: Adventure Together`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MGELFT] = "穆克的塔莎所授万事指南";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VD] = "Vecna Dossier";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SjA] = "Spelljammer Academy";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HAT_TG] = "侠盗荣耀：侠盗画廊";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HAT_LMI] = "侠盗荣耀：传说魔法物品";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GotSF] = "坠星铸炉的巨人";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LK] = "闪电哨站";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CoA] = "Chains of Asmodeus";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PiP] = "Peril in Pinebrook";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DitLCoT] = "索吉坎的失落洞群";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VNotEE] = "维克那：妖眼魔窟";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LRDT] = "Red Dragon's Tale: A LEGO Adventure";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_UtHftLH] = "Uni and the Hunt for the Lost Horn";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ALCoS] = `${Parser.AL_PREFIX}施特拉德的诅咒`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ALEE] = `${Parser.AL_PREFIX}邪恶元素`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ALRoD] = `${Parser.AL_PREFIX}恶魔狂怒`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSA] = `${Parser.PS_PREFIX}阿芒凯`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSI] = `${Parser.PS_PREFIX}依尼翠`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSK] = `${Parser.PS_PREFIX}卡拉德许`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSZ] = `${Parser.PS_PREFIX}赞迪卡`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSX] = `${Parser.PS_PREFIX}依夏兰`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSD] = `${Parser.PS_PREFIX}多明纳里亚`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_XMtS] = `X Marks the Spot`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_UATMC] = `${Parser.UA_PREFIX}秘术师`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV1SC] = `${Parser.MCVX_PREFIX}卷一：魔法船生物`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV2DC] = `${Parser.MCVX_PREFIX}卷二：龙枪生物`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV3MC] = `${Parser.MCVX_PREFIX}卷三：Minecraft生物`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV4EC] = `${Parser.MCVX_PREFIX}卷四：艾卓生物`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MisMV1] = `${Parser.MisMVX_PREFIX}卷一`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AATM] = `${Parser.AA_PREFIX}The Mortuary`;

Parser.SOURCE_JSON_TO_ABV = {};
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PHB] = "PHB'14";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DMG] = "DMG'14";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MM] = "MM'14";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CoS] = "CoS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EEPC] = "EEPC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EET] = "EET";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HotDQ] = "HotDQ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LMoP] = "LMoP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_OotA] = "OotA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PotA] = "PotA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RoT] = "RoT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RoTOS] = "RoTOS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCAG] = "SCAG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SKT] = "SKT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ToA] = "ToA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TLK] = "TLK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ToD] = "ToD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TTP] = "TTP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_AtG] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_DiT] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_TFoF] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_THSoT] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_TSC] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_ToH] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_WPM] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VGM] = "VGM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_XGE] = "XGE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_OGA] = "OGA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MTF] = "MTF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_WDH] = "WDH";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_WDMM] = "WDMM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GGR] = "GGR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_KKW] = "KKW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LLK] = "LLK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AZfyT] = "AZfyT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GoS] = "GoS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AI] = "AI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_OoW] = "OoW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ESK] = "ESK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DIP] = "DIP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HftT] = "HftT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DC] = "DC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SLW] = "SLW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SDW] = "SDW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BGDIA] = "BGDIA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LR] = "LR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AL] = "AL";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SAC] = "SAC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ERLW] = "ERLW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EFR] = "EFR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RMBRE] = "RMBRE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RMR] = "RMR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MFF] = "MFF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AWM] = "AWM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_IMR] = "IMR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SADS] = "SADS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW] = "EGW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_ToR] = "ToR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_DD] = "DD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_FS] = "FS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_US] = "US";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MOT] = "MOT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_IDRotF] = "IDRotF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TCE] = "TCE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VRGR] = "VRGR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HoL] = "HoL";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RtG] = "RtG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR] = "AitFR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_ISF] = "AitFR-ISF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_THP] = "AitFR-THP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_AVT] = "AitFR-AVT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_DN] = "AitFR-DN";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_FCD] = "AitFR-FCD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_WBtW] = "WBtW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DoD] = "DoD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MaBJoV] = "MaBJoV";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_FTD] = "FTD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC] = "SCC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_CK] = "SCC-CK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_HfMT] = "SCC-HfMT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_TMM] = "SCC-TMM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_ARiR] = "SCC-ARiR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MPMM] = "MPMM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CRCotN] = "CRCotN";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_JttRC] = "JttRC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SAiS] = "SAiS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AAG] = "AAG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BAM] = "BAM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LoX] = "LoX";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DoSI] = "DoSI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DSotDQ] = "DSotDQ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_KftGV] = "KftGV";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BGG] = "BGG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TDCSR] = "TDCSR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PaBTSO] = "PaBTSO";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PAitM] = "PAitM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SatO] = "SatO";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ToFW] = "ToFW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MPP] = "MPP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BMT] = "BMT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DMTCRG] = "DMTCRG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_QftIS] = "QftIS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VEoR] = "VEoR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GHLoE] = "GHLoE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DoDk] = "DoDk";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HWCS] = "HWCS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HWAitW] = "HWAitW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ToB1_2023] = "ToB1'23";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_XPHB] = "PHB'24";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_XDMG] = "DMG'24";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_XMM] = "MM'24";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TD] = "TD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN] = "Screen";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN_WILDERNESS_KIT] = "ScWild";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN_DUNGEON_KIT] = "ScDun";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN_SPELLJAMMER] = "ScSJ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HF] = "HF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HFFotM] = "HFFotM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HFStCM] = "HFStCM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PaF] = "PaF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CM] = "CM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH] = "NRH";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_TCMC] = "NRH-TCMC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_AVitW] = "NRH-AVitW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_ASS] = "NRH-ASS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_CoI] = "NRH-CoI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_TLT] = "NRH-TLT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_AWoL] = "NRH-AWoL";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_AT] = "NRH-AT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MGELFT] = "MGELFT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VD] = "VD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SjA] = "SjA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HAT_TG] = "HAT-TG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HAT_LMI] = "HAT-LMI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GotSF] = "GotSF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LK] = "LK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CoA] = "CoA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PiP] = "PiP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DitLCoT] = "DitLCoT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VNotEE] = "VNotEE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LRDT] = "LRDT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_UtHftLH] = "UHftLH";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ALCoS] = "ALCoS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ALEE] = "ALEE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ALRoD] = "ALRoD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSA] = "PSA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSI] = "PSI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSK] = "PSK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSZ] = "PSZ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSX] = "PSX";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSD] = "PSD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_XMtS] = "XMtS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_UATMC] = "UAMy";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV1SC] = "MCV1SC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV2DC] = "MCV2DC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV3MC] = "MCV3MC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV4EC] = "MCV4EC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MisMV1] = "MisMV1";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AATM] = "AATM";

Parser.SOURCE_JSON_TO_DATE = {};
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PHB] = "2014-08-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DMG] = "2014-12-09";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MM] = "2014-09-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CoS] = "2016-03-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EEPC] = "2015-03-10";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EET] = "2015-03-10";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HotDQ] = "2014-08-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LMoP] = "2014-07-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_OotA] = "2015-09-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PotA] = "2015-04-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RoT] = "2014-11-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RoTOS] = "2014-11-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCAG] = "2015-11-03";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SKT] = "2016-09-06";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ToA] = "2017-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TLK] = "2017-11-28";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ToD] = "2019-10-22";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TTP] = "2017-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_AtG] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_DiT] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_TFoF] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_THSoT] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_TSC] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_ToH] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_WPM] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VGM] = "2016-11-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_XGE] = "2017-11-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_OGA] = "2017-10-11";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MTF] = "2018-05-29";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_WDH] = "2018-09-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_WDMM] = "2018-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GGR] = "2018-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_KKW] = "2018-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LLK] = "2018-11-10";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AZfyT] = "2019-03-05";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GoS] = "2019-05-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AI] = "2019-06-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_OoW] = "2019-06-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ESK] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DIP] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HftT] = "2019-05-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DC] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SLW] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SDW] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BGDIA] = "2019-09-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LR] = "2019-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SAC] = "2019-01-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ERLW] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EFR] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RMBRE] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RMR] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MFF] = "2019-11-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AWM] = "2019-11-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_IMR] = "2019-11-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SADS] = "2019-12-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_ToR] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_DD] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_FS] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_US] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MOT] = "2020-06-02";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_IDRotF] = "2020-09-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TCE] = "2020-11-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VRGR] = "2021-05-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HoL] = "2021-05-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RtG] = "2021-05-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR] = "2021-06-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_ISF] = "2021-06-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_THP] = "2021-07-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_AVT] = "2021-07-14";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_DN] = "2021-07-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_FCD] = "2021-07-28";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_WBtW] = "2021-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DoD] = "2021-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MaBJoV] = "2021-10-05";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_FTD] = "2021-11-26";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_CK] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_HfMT] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_TMM] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_ARiR] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MPMM] = "2022-01-25";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CRCotN] = "2022-03-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_JttRC] = "2022-07-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SAiS] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AAG] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BAM] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LoX] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DoSI] = "2022-07-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DSotDQ] = "2022-11-22";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_KftGV] = "2023-02-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BGG] = "2023-08-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TDCSR] = "2022-01-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PaBTSO] = "2023-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PAitM] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SatO] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ToFW] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MPP] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BMT] = "2023-11-14";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DMTCRG] = "2023-11-14";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_QftIS] = "2024-07-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VEoR] = "2024-05-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GHLoE] = "2023-11-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DoDk] = "2023-12-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HWCS] = "2019-06-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HWAitW] = "2019-06-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ToB1_2023] = "2023-05-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_XPHB] = "2024-09-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_XDMG] = "2024-11-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_XMM] = "2025-02-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TD] = "2022-05-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN] = "2015-01-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN_WILDERNESS_KIT] = "2020-11-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN_DUNGEON_KIT] = "2020-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN_SPELLJAMMER] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HF] = "2020-10-27";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HFFotM] = "2023-11-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HFStCM] = "2023-11-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PaF] = "2024-08-27";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CM] = "2021-03-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_TCMC] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_AVitW] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_ASS] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_CoI] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_TLT] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_AWoL] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_AT] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MGELFT] = "2020-12-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VD] = "2022-06-09";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SjA] = "2022-07-11"; // pt1; pt2 2022-07-18; pt3 2022-07-25; pt4 2022-08-01
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HAT_TG] = "2023-03-06";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HAT_LMI] = "2023-03-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GotSF] = "2023-08-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LK] = "2023-09-26";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CoA] = "2023-10-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PiP] = "2023-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DitLCoT] = "2024-03-26";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VNotEE] = "2024-04-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LRDT] = "2024-04-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_UtHftLH] = "2024-09-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ALCoS] = "2016-03-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ALEE] = "2015-04-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ALRoD] = "2015-09-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSA] = "2017-07-06";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSI] = "2016-07-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSK] = "2017-02-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSZ] = "2016-04-27";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSX] = "2018-01-09";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSD] = "2018-07-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_XMtS] = "2017-12-11";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_UATMC] = "2017-03-13";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV1SC] = "2022-04-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV2DC] = "2022-12-05";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV3MC] = "2023-03-28";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV4EC] = "2023-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MisMV1] = "2023-05-03";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AATM] = "2023-10-17";

// region Source categories
Parser.SOURCES_ADVENTURES = new Set([
	Parser.SRC_LMoP,
	Parser.SRC_HotDQ,
	Parser.SRC_RoT,
	Parser.SRC_RoTOS,
	Parser.SRC_PotA,
	Parser.SRC_OotA,
	Parser.SRC_CoS,
	Parser.SRC_SKT,
	Parser.SRC_TYP,
	Parser.SRC_TYP_AtG,
	Parser.SRC_TYP_DiT,
	Parser.SRC_TYP_TFoF,
	Parser.SRC_TYP_THSoT,
	Parser.SRC_TYP_TSC,
	Parser.SRC_TYP_ToH,
	Parser.SRC_TYP_WPM,
	Parser.SRC_ToA,
	Parser.SRC_TLK,
	Parser.SRC_TTP,
	Parser.SRC_WDH,
	Parser.SRC_LLK,
	Parser.SRC_WDMM,
	Parser.SRC_KKW,
	Parser.SRC_AZfyT,
	Parser.SRC_GoS,
	Parser.SRC_HftT,
	Parser.SRC_OoW,
	Parser.SRC_DIP,
	Parser.SRC_SLW,
	Parser.SRC_SDW,
	Parser.SRC_DC,
	Parser.SRC_BGDIA,
	Parser.SRC_LR,
	Parser.SRC_EFR,
	Parser.SRC_RMBRE,
	Parser.SRC_IMR,
	Parser.SRC_EGW_ToR,
	Parser.SRC_EGW_DD,
	Parser.SRC_EGW_FS,
	Parser.SRC_EGW_US,
	Parser.SRC_IDRotF,
	Parser.SRC_CM,
	Parser.SRC_HoL,
	Parser.SRC_XMtS,
	Parser.SRC_RtG,
	Parser.SRC_AitFR,
	Parser.SRC_AitFR_ISF,
	Parser.SRC_AitFR_THP,
	Parser.SRC_AitFR_AVT,
	Parser.SRC_AitFR_DN,
	Parser.SRC_AitFR_FCD,
	Parser.SRC_WBtW,
	Parser.SRC_NRH,
	Parser.SRC_NRH_TCMC,
	Parser.SRC_NRH_AVitW,
	Parser.SRC_NRH_ASS,
	Parser.SRC_NRH_CoI,
	Parser.SRC_NRH_TLT,
	Parser.SRC_NRH_AWoL,
	Parser.SRC_NRH_AT,
	Parser.SRC_SCC,
	Parser.SRC_SCC_CK,
	Parser.SRC_SCC_HfMT,
	Parser.SRC_SCC_TMM,
	Parser.SRC_SCC_ARiR,
	Parser.SRC_CRCotN,
	Parser.SRC_JttRC,
	Parser.SRC_SjA,
	Parser.SRC_LoX,
	Parser.SRC_DoSI,
	Parser.SRC_DSotDQ,
	Parser.SRC_KftGV,
	Parser.SRC_GotSF,
	Parser.SRC_PaBTSO,
	Parser.SRC_LK,
	Parser.SRC_CoA,
	Parser.SRC_PiP,
	Parser.SRC_DitLCoT,
	Parser.SRC_VNotEE,
	Parser.SRC_LRDT,
	Parser.SRC_UtHftLH,
	Parser.SRC_HFStCM,
	Parser.SRC_GHLoE,
	Parser.SRC_DoDk,
	Parser.SRC_HWAitW,

	Parser.SRC_AWM,
]);
Parser.SOURCES_CORE_SUPPLEMENTS = new Set(Object.keys(Parser.SOURCE_JSON_TO_FULL).filter(it => !Parser.SOURCES_ADVENTURES.has(it)));
Parser.SOURCES_NON_STANDARD_WOTC = new Set([
	Parser.SRC_OGA,
	Parser.SRC_LLK,
	Parser.SRC_AZfyT,
	Parser.SRC_LR,
	Parser.SRC_TLK,
	Parser.SRC_TTP,
	Parser.SRC_AWM,
	Parser.SRC_IMR,
	Parser.SRC_SADS,
	Parser.SRC_MFF,
	Parser.SRC_XMtS,
	Parser.SRC_RtG,
	Parser.SRC_AitFR,
	Parser.SRC_AitFR_ISF,
	Parser.SRC_AitFR_THP,
	Parser.SRC_AitFR_AVT,
	Parser.SRC_AitFR_DN,
	Parser.SRC_AitFR_FCD,
	Parser.SRC_DoD,
	Parser.SRC_MaBJoV,
	Parser.SRC_NRH,
	Parser.SRC_NRH_TCMC,
	Parser.SRC_NRH_AVitW,
	Parser.SRC_NRH_ASS,
	Parser.SRC_NRH_CoI,
	Parser.SRC_NRH_TLT,
	Parser.SRC_NRH_AWoL,
	Parser.SRC_NRH_AT,
	Parser.SRC_MGELFT,
	Parser.SRC_VD,
	Parser.SRC_SjA,
	Parser.SRC_HAT_TG,
	Parser.SRC_HAT_LMI,
	Parser.SRC_GotSF,
	Parser.SRC_MCV3MC,
	Parser.SRC_MCV4EC,
	Parser.SRC_MisMV1,
	Parser.SRC_LK,
	Parser.SRC_AATM,
	Parser.SRC_CoA,
	Parser.SRC_PiP,
	Parser.SRC_HFStCM,
	Parser.SRC_UtHftLH,
]);
Parser.SOURCES_PARTNERED_WOTC = new Set([
	Parser.SRC_RMBRE,
	Parser.SRC_RMR,
	Parser.SRC_EGW,
	Parser.SRC_EGW_ToR,
	Parser.SRC_EGW_DD,
	Parser.SRC_EGW_FS,
	Parser.SRC_EGW_US,
	Parser.SRC_CRCotN,
	Parser.SRC_TDCSR,
	Parser.SRC_HftT,
	Parser.SRC_GHLoE,
	Parser.SRC_DoDk,
	Parser.SRC_HWCS,
	Parser.SRC_HWAitW,
	Parser.SRC_ToB1_2023,
	Parser.SRC_TD,
	Parser.SRC_LRDT,
]);
Parser.SOURCES_LEGACY_WOTC = new Set([
	Parser.SRC_PHB,
	// Parser.SRC_DMG, // TODO(XDMG)
	// Parser.SRC_MM, // TODO(XMM)
	Parser.SRC_EEPC,
	Parser.SRC_VGM,
	Parser.SRC_MTF,
]);

// An opinionated set of source that could be considered "core-core"
Parser.SOURCES_VANILLA = new Set([
	// Parser.SRC_DMG, // "Legacy" source, removed in favor of XDMG
	// Parser.SRC_MM, // "Legacy" source, removed in favor of XMM
	// Parser.SRC_PHB, // "Legacy" source, removed in favor of XPHB
	Parser.SRC_XDMG,
	Parser.SRC_XMM,
	Parser.SRC_XPHB,
	Parser.SRC_SCAG,
	// Parser.SRC_TTP, // "Legacy" source, removed in favor of MPMM
	// Parser.SRC_VGM, // "Legacy" source, removed in favor of MPMM
	Parser.SRC_XGE,
	// Parser.SRC_MTF, // "Legacy" source, removed in favor of MPMM
	Parser.SRC_SAC,
	Parser.SRC_MFF,
	Parser.SRC_SADS,
	Parser.SRC_TCE,
	Parser.SRC_FTD,
	Parser.SRC_MPMM,
	Parser.SRC_SCREEN,
	Parser.SRC_SCREEN_WILDERNESS_KIT,
	Parser.SRC_SCREEN_DUNGEON_KIT,
	Parser.SRC_VD,
	Parser.SRC_GotSF,
	Parser.SRC_BGG,
	Parser.SRC_MaBJoV,
	Parser.SRC_CoA,
	Parser.SRC_BMT,
	Parser.SRC_DMTCRG,
]);

// Any opinionated set of sources that are """hilarious, dude"""
Parser.SOURCES_COMEDY = new Set([
	Parser.SRC_AI,
	Parser.SRC_OoW,
	Parser.SRC_RMR,
	Parser.SRC_RMBRE,
	Parser.SRC_HftT,
	Parser.SRC_AWM,
	Parser.SRC_MGELFT,
	Parser.SRC_HAT_TG,
	Parser.SRC_HAT_LMI,
	Parser.SRC_MCV3MC,
	Parser.SRC_MisMV1,
	Parser.SRC_LK,
	Parser.SRC_PiP,
	Parser.SRC_LRDT,
	Parser.SRC_UtHftLH,
]);

// Any opinionated set of sources that are "other settings"
Parser.SOURCES_NON_FR = new Set([
	Parser.SRC_GGR,
	Parser.SRC_KKW,
	Parser.SRC_ERLW,
	Parser.SRC_EFR,
	Parser.SRC_EGW,
	Parser.SRC_EGW_ToR,
	Parser.SRC_EGW_DD,
	Parser.SRC_EGW_FS,
	Parser.SRC_EGW_US,
	Parser.SRC_MOT,
	Parser.SRC_XMtS,
	Parser.SRC_AZfyT,
	Parser.SRC_SCC,
	Parser.SRC_SCC_CK,
	Parser.SRC_SCC_HfMT,
	Parser.SRC_SCC_TMM,
	Parser.SRC_SCC_ARiR,
	Parser.SRC_CRCotN,
	Parser.SRC_SjA,
	Parser.SRC_SAiS,
	Parser.SRC_AAG,
	Parser.SRC_BAM,
	Parser.SRC_LoX,
	Parser.SRC_DSotDQ,
	Parser.SRC_TDCSR,
	Parser.SRC_PAitM,
	Parser.SRC_SatO,
	Parser.SRC_ToFW,
	Parser.SRC_MPP,
	Parser.SRC_MCV4EC,
	Parser.SRC_LK,
	Parser.SRC_GHLoE,
	Parser.SRC_DoDk,
	Parser.SRC_HWCS,
	Parser.SRC_HWAitW,
	Parser.SRC_ToB1_2023,
	Parser.SRC_LRDT,
	Parser.SRC_UtHftLH,
]);

// endregion
Parser.SOURCES_AVAILABLE_DOCS_BOOK = {};
[
	Parser.SRC_PHB,
	Parser.SRC_MM,
	Parser.SRC_DMG,
	Parser.SRC_SCAG,
	Parser.SRC_VGM,
	Parser.SRC_OGA,
	Parser.SRC_XGE,
	Parser.SRC_MTF,
	Parser.SRC_GGR,
	Parser.SRC_AI,
	Parser.SRC_ERLW,
	Parser.SRC_RMR,
	Parser.SRC_EGW,
	Parser.SRC_MOT,
	Parser.SRC_TCE,
	Parser.SRC_VRGR,
	Parser.SRC_DoD,
	Parser.SRC_MaBJoV,
	Parser.SRC_FTD,
	Parser.SRC_SCC,
	Parser.SRC_MPMM,
	Parser.SRC_AAG,
	Parser.SRC_BAM,
	Parser.SRC_HAT_TG,
	Parser.SRC_SCREEN,
	Parser.SRC_SCREEN_WILDERNESS_KIT,
	Parser.SRC_SCREEN_DUNGEON_KIT,
	Parser.SRC_SCREEN_SPELLJAMMER,
	Parser.SRC_BGG,
	Parser.SRC_TDCSR,
	Parser.SRC_SatO,
	Parser.SRC_MPP,
	Parser.SRC_HF,
	Parser.SRC_HFFotM,
	Parser.SRC_PaF,
	Parser.SRC_BMT,
	Parser.SRC_DMTCRG,
	Parser.SRC_HWCS,
	Parser.SRC_ToB1_2023,
	Parser.SRC_XPHB,
	Parser.SRC_XMM,
	Parser.SRC_XDMG,
	Parser.SRC_TD,
].forEach(src => {
	Parser.SOURCES_AVAILABLE_DOCS_BOOK[src] = src;
	Parser.SOURCES_AVAILABLE_DOCS_BOOK[src.toLowerCase()] = src;
});
[
	{src: Parser.SRC_PSA, id: "PS-A"},
	{src: Parser.SRC_PSI, id: "PS-I"},
	{src: Parser.SRC_PSK, id: "PS-K"},
	{src: Parser.SRC_PSZ, id: "PS-Z"},
	{src: Parser.SRC_PSX, id: "PS-X"},
	{src: Parser.SRC_PSD, id: "PS-D"},
].forEach(({src, id}) => {
	Parser.SOURCES_AVAILABLE_DOCS_BOOK[src] = id;
	Parser.SOURCES_AVAILABLE_DOCS_BOOK[src.toLowerCase()] = id;
});
Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE = {};
[
	Parser.SRC_LMoP,
	Parser.SRC_HotDQ,
	Parser.SRC_RoT,
	Parser.SRC_PotA,
	Parser.SRC_OotA,
	Parser.SRC_CoS,
	Parser.SRC_SKT,
	Parser.SRC_TYP_AtG,
	Parser.SRC_TYP_DiT,
	Parser.SRC_TYP_TFoF,
	Parser.SRC_TYP_THSoT,
	Parser.SRC_TYP_TSC,
	Parser.SRC_TYP_ToH,
	Parser.SRC_TYP_WPM,
	Parser.SRC_ToA,
	Parser.SRC_TLK,
	Parser.SRC_TTP,
	Parser.SRC_WDH,
	Parser.SRC_LLK,
	Parser.SRC_WDMM,
	Parser.SRC_KKW,
	Parser.SRC_AZfyT,
	Parser.SRC_GoS,
	Parser.SRC_HftT,
	Parser.SRC_OoW,
	Parser.SRC_DIP,
	Parser.SRC_SLW,
	Parser.SRC_SDW,
	Parser.SRC_DC,
	Parser.SRC_BGDIA,
	Parser.SRC_LR,
	Parser.SRC_EFR,
	Parser.SRC_RMBRE,
	Parser.SRC_IMR,
	Parser.SRC_EGW_ToR,
	Parser.SRC_EGW_DD,
	Parser.SRC_EGW_FS,
	Parser.SRC_EGW_US,
	Parser.SRC_IDRotF,
	Parser.SRC_CM,
	Parser.SRC_HoL,
	Parser.SRC_XMtS,
	Parser.SRC_RtG,
	Parser.SRC_AitFR_ISF,
	Parser.SRC_AitFR_THP,
	Parser.SRC_AitFR_AVT,
	Parser.SRC_AitFR_DN,
	Parser.SRC_AitFR_FCD,
	Parser.SRC_WBtW,
	Parser.SRC_NRH,
	Parser.SRC_NRH_TCMC,
	Parser.SRC_NRH_AVitW,
	Parser.SRC_NRH_ASS,
	Parser.SRC_NRH_CoI,
	Parser.SRC_NRH_TLT,
	Parser.SRC_NRH_AWoL,
	Parser.SRC_NRH_AT,
	Parser.SRC_SCC_CK,
	Parser.SRC_SCC_HfMT,
	Parser.SRC_SCC_TMM,
	Parser.SRC_SCC_ARiR,
	Parser.SRC_CRCotN,
	Parser.SRC_JttRC,
	Parser.SRC_LoX,
	Parser.SRC_DoSI,
	Parser.SRC_DSotDQ,
	Parser.SRC_KftGV,
	Parser.SRC_GotSF,
	Parser.SRC_PaBTSO,
	Parser.SRC_ToFW,
	Parser.SRC_LK,
	Parser.SRC_CoA,
	Parser.SRC_PiP,
	Parser.SRC_DitLCoT,
	Parser.SRC_HFStCM,
	Parser.SRC_GHLoE,
	Parser.SRC_DoDk,
	Parser.SRC_HWAitW,
	Parser.SRC_QftIS,
	Parser.SRC_LRDT,
	Parser.SRC_VEoR,
	Parser.SRC_VNotEE,
	Parser.SRC_UtHftLH,
].forEach(src => {
	Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[src] = src;
	Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[src.toLowerCase()] = src;
});

Parser.getTagSource = function (tag, source) {
	if (source && source.trim()) return source;

	tag = tag.trim();

	const tagMeta = Renderer.tag.TAG_LOOKUP[tag];

	if (!tagMeta) throw new Error(`Unhandled tag "${tag}"`);
	return tagMeta.defaultSource;
};

Parser.PROP_TO_TAG = {
	"monster": "creature",
	"optionalfeature": "optfeature",
	"tableGroup": "table",
	"vehicleUpgrade": "vehupgrade",
	"baseitem": "item",
	"itemGroup": "item",
	"magicvariant": "item",
};
Parser.getPropTag = function (prop) {
	if (Parser.PROP_TO_TAG[prop]) return Parser.PROP_TO_TAG[prop];
	return prop;
};

Parser.PROP_TO_DISPLAY_NAME = {
	"variantrule": "Rule",
	"optionalfeature": "Option/Feature",
	"magicvariant": "Magic Item Variant",
	"baseitem": "Item (Base)",
	"item": "Item",
	"adventure": "Adventure",
	"adventureData": "Adventure Text",
	"book": "Book",
	"bookData": "Book Text",
	"makebrewCreatureTrait": "Homebrew Builder Creature Trait",
	"charoption": "Other Character Creation Option",

	"bonus": "Bonus Action",
	"legendary": "Legendary Action",
	"mythic": "Mythic Action",
	"lairActions": "Lair Action",
	"regionalEffects": "Regional Effect",
	"condition": "状态",
	"disease": "疾病"
};
Parser.getPropDisplayName = function (prop, {suffix = ""} = {}) {
	if (Parser.PROP_TO_DISPLAY_NAME[prop]) return `${Parser.PROP_TO_DISPLAY_NAME[prop]}${suffix}`;

	const mFluff = /Fluff$/.exec(prop);
	if (mFluff) return Parser.getPropDisplayName(prop.slice(0, -mFluff[0].length), {suffix: " Fluff"});

	const mFoundry = /^foundry(?<prop>[A-Z].*)$/.exec(prop);
	if (mFoundry) return Parser.getPropDisplayName(mFoundry.groups.prop.lowercaseFirst(), {suffix: " Foundry Data"});

	return `${prop.split(/([A-Z][a-z]+)/g).filter(Boolean).join(" ").uppercaseFirst()}${suffix}`;
};

Parser.DMGTYPE_JSON_TO_FULL = {
	"A": "强酸",
	"B": "钝击",
	"C": "冷冻",
	"F": "火焰",
	"O": "力场",
	"L": "闪电",
	"N": "黯蚀",
	"P": "穿刺",
	"I": "毒素",
	"Y": "心灵",
	"R": "光耀",
	"S": "挥砍",
	"T": "雷鸣",
};

Parser.DMG_TYPES = ["强酸", "钝击", "冷冻", "火焰", "力场", "闪电", "黯蚀", "穿刺", "毒素", "心灵", "光耀", "挥砍", "雷鸣"];
Parser.CONDITIONS = ["目盲", "魅惑", "耳聋", "力竭", "恐慌", "擒抱", "失能", "隐形", "麻痹", "石化", "中毒", "倒地", "束缚", "震慑", "昏迷"];
Parser.SENSES = [
	{"name": "blindsight", "source": Parser.SRC_PHB},
	{"name": "darkvision", "source": Parser.SRC_PHB},
	{"name": "tremorsense", "source": Parser.SRC_MM},
	{"name": "truesight", "source": Parser.SRC_PHB},
];

Parser.NUMBERS_ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
Parser.NUMBERS_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
Parser.NUMBERS_TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];

// region Metric conversion
Parser.metric = {
	// See MPMB's breakdown: https://old.reddit.com/r/dndnext/comments/6gkuec
	MILES_TO_KILOMETRES: 1.6,
	FEET_TO_METRES: 0.3, // 5 ft = 1.5 m
	YARDS_TO_METRES: 0.9, // (as above)
	POUNDS_TO_KILOGRAMS: 0.5, // 2 lb = 1 kg

	getMetricNumber ({originalValue, originalUnit, toFixed = null}) {
		if (originalValue == null || isNaN(originalValue)) return originalValue;

		originalValue = Number(originalValue);
		if (!originalValue) return originalValue;

		let out = null;
		switch (originalUnit) {
			case "ft.": case "ft": case Parser.UNT_FEET: out = originalValue * Parser.metric.FEET_TO_METRES; break;
			case "yd.": case "yd": case Parser.UNT_YARDS: out = originalValue * Parser.metric.YARDS_TO_METRES; break;
			case "mi.": case "mi": case Parser.UNT_MILES: out = originalValue * Parser.metric.MILES_TO_KILOMETRES; break;
			case "lb.": case "lb": case Parser.UNT_LBS: out = originalValue * Parser.metric.POUNDS_TO_KILOGRAMS; break;
			default: return originalValue;
		}
		if (toFixed != null) return NumberUtil.toFixedNumber(out, toFixed);
		return out;
	},

	getMetricUnit ({originalUnit, isShortForm = false, isPlural = true}) {
		switch (originalUnit) {
			case "ft.": case "ft": case Parser.UNT_FEET: return isShortForm ? "m" : `meter`[isPlural ? "toPlural" : "toString"]();
			case "yd.": case "yd": case Parser.UNT_YARDS: return isShortForm ? "m" : `meter`[isPlural ? "toPlural" : "toString"]();
			case "mi.": case "mi": case Parser.UNT_MILES: return isShortForm ? "km" : `kilometre`[isPlural ? "toPlural" : "toString"]();
			case "lb.": case "lb": case Parser.UNT_LBS: return isShortForm ? "kg" : `kilogram`[isPlural ? "toPlural" : "toString"]();
			default: return originalUnit;
		}
	},
};
// endregion
// region Map grids

Parser.MAP_GRID_TYPE_TO_FULL = {};
Parser.MAP_GRID_TYPE_TO_FULL["none"] = "None";
Parser.MAP_GRID_TYPE_TO_FULL["square"] = "Square";
Parser.MAP_GRID_TYPE_TO_FULL["hexRowsOdd"] = "Hex Rows (Odd)";
Parser.MAP_GRID_TYPE_TO_FULL["hexRowsEven"] = "Hex Rows (Even)";
Parser.MAP_GRID_TYPE_TO_FULL["hexColsOdd"] = "Hex Columns (Odd)";
Parser.MAP_GRID_TYPE_TO_FULL["hexColsEven"] = "Hex Columns (Even)";

Parser.mapGridTypeToFull = function (gridType) {
	return Parser._parse_aToB(Parser.MAP_GRID_TYPE_TO_FULL, gridType);
};

Parser.LANGUAGES_TO_CN = {
	"auran": "气族语",
	"aquan": "水族语",
	"abyssal": "深渊语",
	"celestial": "天界语",
	// "Choose":,
	"common": "通用语",
	"deep speech": "深潜语",
	"draconic": "龙语",
	"druidic": "德鲁伊语",
	"dwarvish": "矮人语",
	"elvish": "精灵语",
	"giant": "巨人语",
	"gith": "吉斯语",
	"gnomish": "侏儒语",
	"goblin": "地精语",
	"halfling": "半身人语",
	"ignan": "火族语",
	"infernal": "炼狱语",
	"orc": "兽人语",
	"other": "其他",
	"primordial": "原初语",
	"terran": "土族语",
	"thieves' cant": "盗贼黑话",
	"sylvan": "木族语",
	"undercommon": "地底通用语"
}

Parser.TOOLS_TO_CN = {
	"alchemist's supplies": "炼金工具",
	"artisan's tools": "工匠工具",
	"brewer's supplies": "酿酒工具",
	"calligrapher's supplies": "书法工具",
	"carpenter's tools": "木匠工具",
	"cartographer's tools": "制图工具",
	"cook's utensils": "厨师工具",
	"disguise kit": "易容工具",
	"forgery kit": "文书伪造工具",
	"gaming set": "赌博工具",
	"herbalism kit": "草药工具",
	"musical instrument": "乐器",
	"navigator's tools": "领航工具",
	"poisoner's kit": "制毒工具",
	"thieves' tools": "盗贼工具",
	"tinker's tools": "修理工具",
	"vehicles (air)": "载具(空运)",
	"vehicles (land)": "载具(陆运)",
	"vehicles (space)": "载具(航空)",
	"vehicles (water)": "载具(水运)",
}

Parser.MON_TAG_TO_CN = {
	"aarakocra": "阿兰寇拉鹰人",
	"adult chromatic": "成年色彩龙",
	"angel": "天使",
	"any": "任意",
	"any race": "任意种族",
	"archfey": "至高妖精",
	"bard": "吟游诗人",
	"beholder": "眼魔",
	"bullywug": "狂蛙人",
	"cattle": "牛",
	"changeling": "幻身灵",
	"chromatic": "太古龙",
	"cleric": "牧师",
	"cloud giant": "云巨人",
	"demon": "恶魔",
	"derro": "德洛人",
	"devil": "魔鬼",
	"dinosaur": "恐龙",
	"dragonborn": "龙裔",
	"drow": "卓尔",
	"druid": "德鲁伊",
	"dwarf": "矮人",
	"fire giant": "火巨人",
	"elf": "精灵",
	"firenewt": "熔螈",
	"frost giant": "霜巨人",
	"gallus": "雉族",
	"gem": "宝石龙",
	"genasi": "元素裔",
	"gith": "吉斯人",
	"gnoll": "豺狼人",
	"gnome": "侏儒",
	"goblinoid": "类地精",
	"grimlock": "石盲蛮族",
	"goliath": "歌利亚",
	"grung": "格龙蛙人",
	"hag": "鬼婆",
	"half-black dragon": "半黑龙",
	"half-dragon": "半龙",
	"half-elf": "半精灵",
	"half-orc": "半兽人",
	"halfling": "半身人",
	"harengon": "兔人",
	"healer": "治疗者",
	"hill giant": "山丘巨人",
	"human": "人类",
	"inevitable": "制裁者",
	"kalashtar": "离梦人",
	"kender": "坎德人",
	"kenku": "天狗",
	"kobold": "狗头人",
	"kraul": "刻洛",
	"kuo-toa": "寇涛鱼人",
	"lava child": "熔岩之子",
	"leonin": "狮族",
	"lizardfolk": "蜥蜴人",
	"locathah": "洛卡鱼人",
	"mage": "魔术师",
	"meazel": "鬾魊",
	"medusa": "美杜莎",
	"merfolk": "人鱼",
	"metallic": "金属龙",
	"mind flayer": "夺心魔",
	"minotaur": "牛头人",
	"mongrelfolk": "混种人",
	"monk": "武僧",
	"moonstone": "月石龙",
	"nagpa": "那加帕",
	"orc": "兽人",
	"paladin": "圣武士",
	"sahuagin": "沙华鱼人",
	"quaggoth": "泽地熊人",
	"saurial": "类蜴人",
	"shadar-kai": "影灵",
	"shapechanger": "变形生物",
	"shifter": "化兽者",
	"simic hybrid": "析米克混生体",
	"sorcerer": "术士",
	"stone giant": "石巨人",
	"storm giant": "风暴巨人",
	"swarm": "集群",
	"tabaxi": "斑猫人",
	"saurial": "类蜴人",
	"thri-kreen": "螳螂人",
	"tiefling": "提夫林",
	"titan": "泰坦",
	"tortle": "龟人",
	"triton": "屈东",
	"troglodyte": "穴蜥人",
	"vampire": "吸血鬼",
	"warforged": "战俑",
	"warlock": "邪术师",
	"wizard": "法师",
	"xvart": "法特怪",
	"young gem": "青年宝石龙",
	"yuan-ti": "蛇人",
	"yugoloth": "尤格罗斯魔",
	"attacker": "攻击手",
	"defender": "防御者"

}

Parser.MON_TAG_PREFIX_TO_CN = {
	"fire": "火",
	"water": "水",
	"earth": "土",
	"wood": "木",
	"dusk": "暮",
	"high": "高",
	"mountain": "山地",
	"deep": "地底",
	"rock": "岩石",
	"strongheart": "强心",
	"stout": "敦实",
	"lightfoot": "轻足",
	"illuskan": "伊路斯坎",
	"turami": "图拉米",
	"tethyrian": "泰瑟尔",
	"mulan": "穆兰",
	"damaran": "达马拉",
	"chondathan": "琼达斯",
	"shou": "受国",
}

Parser.MON_SIDEKICK_TO_CN = {
	"warrior": "武者",
	"expert": "专家",
	"spellcaster": "施法者",
	"attacker": "攻击手",
	"defender": "防御者",
	"healer": "治疗者",
	"mage": "魔术师"
}
// endregion
