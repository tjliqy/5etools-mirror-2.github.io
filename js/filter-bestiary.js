"use strict";

class PageFilterBestiary extends PageFilterBase {
	static _NEUT_ALIGNS = ["NX", "NY"];
	static MISC_FILTER_SPELLCASTER = "Spellcaster, ";
	static _RE_SPELL_TAG = /{@spell ([^}]+)}/g;
	static _RE_ITEM_TAG = /{@item ([^}]+)}/g;
	static _WALKER = null;
	static _BASIC_ENTRY_PROPS = [
		"trait",
		"action",
		"bonus",
		"reaction",
		"legendary",
		"mythic",
	];
	static _DRAGON_AGES = ["wyrmling", "young", "adult", "ancient", "greatwyrm", "aspect"];

	// region static
	static sortMonsters (a, b, o) {
		if (o.sortBy === "count") return SortUtil.ascSort(a.data.count, b.data.count) || SortUtil.compareListNames(a, b);
		switch (o.sortBy) {
			case "name": return SortUtil.compareListNames(a, b);
			case "type": return SortUtil.ascSort(a.values.type, b.values.type) || SortUtil.compareListNames(a, b);
			case "source": return SortUtil.ascSort(a.values.source, b.values.source) || SortUtil.compareListNames(a, b);
			case "cr": return SortUtil.ascSortCr(a.values.cr, b.values.cr) || SortUtil.compareListNames(a, b);
			case "page": return SortUtil.ascSort(a.values.page, b.values.page) || SortUtil.compareListNames(a, b);
		}
	}

	static ascSortMiscFilter (a, b) {
		a = a.item;
		b = b.item;
		if (a.includes(PageFilterBestiary.MISC_FILTER_SPELLCASTER) && b.includes(PageFilterBestiary.MISC_FILTER_SPELLCASTER)) {
			a = Parser.attFullToAbv(a.replace(PageFilterBestiary.MISC_FILTER_SPELLCASTER, ""));
			b = Parser.attFullToAbv(b.replace(PageFilterBestiary.MISC_FILTER_SPELLCASTER, ""));
			return SortUtil.ascSortAtts(a, b);
		} else {
			a = Parser.monMiscTagToFull(a);
			b = Parser.monMiscTagToFull(b);
			return SortUtil.ascSortLower(a, b);
		}
	}

	static _ascSortDragonAgeFilter (a, b) {
		a = a.item;
		b = b.item;
		const ixA = PageFilterBestiary._DRAGON_AGES.indexOf(a);
		const ixB = PageFilterBestiary._DRAGON_AGES.indexOf(b);
		if (~ixA && ~ixB) return SortUtil.ascSort(ixA, ixB);
		if (~ixA) return Number.MIN_SAFE_INTEGER;
		if (~ixB) return Number.MAX_SAFE_INTEGER;
		return SortUtil.ascSortLower(a, b);
	}

	static getAllImmRest (toParse, key) {
		const out = [];
		for (const it of toParse) this._getAllImmRest_recurse(it, key, out); // Speed > safety
		return out;
	}

	static _getAllImmRest_recurse (it, key, out, conditional) {
		if (typeof it === "string") {
			out.push(conditional ? `${it} (条件)` : it);
		} else if (it[key]) {
			it[key].forEach(nxt => this._getAllImmRest_recurse(nxt, key, out, !!it.cond));
		}
	}

	static _getDamageTagDisplayText (tag) { return Parser.dmgTypeToFull(tag).toTitleCase(); }
	static _getConditionDisplayText (uid) { return uid.split("|")[0].toTitleCase(); }
	static _getAbilitySaveDisplayText (abl) { return `${abl.uppercaseFirst()} Save`; }
	// endregion

	constructor () {
		super();

		this._crFilter = new RangeFilter({
			header: "Challenge Rating",
			cnHeader: "挑战等级",
			isLabelled: true,
			labelSortFn: SortUtil.ascSortCr,
			labels: [...Parser.CRS, "Unknown", "\u2014"],
			labelDisplayFn: it => it === "\u2014" ? "None" : it,
		});
		this._sizeFilter = new Filter({
			header: "Size",
			cnHeader: "体型",
			items: [
				Parser.SZ_TINY,
				Parser.SZ_SMALL,
				Parser.SZ_MEDIUM,
				Parser.SZ_LARGE,
				Parser.SZ_HUGE,
				Parser.SZ_GARGANTUAN,
				Parser.SZ_VARIES,
			],
			displayFn: Parser.sizeAbvToFull,
			itemSortFn: null,
		});
		this._speedFilter = new RangeFilter({header: "Speed", cnHeader: "速度", min: 30, max: 30, suffix: " ft"});
		this._speedTypeFilter = new Filter({header: "Speed Type", cnHeader: "速度类型", items: [...Parser.SPEED_MODES, "hover"], displayFn: StrUtil.uppercaseFirst});
		this._strengthFilter = new RangeFilter({header: "Strength", cnHeader: "力量", min: 1, max: 30});
		this._dexterityFilter = new RangeFilter({header: "Dexterity", cnHeader: "敏捷", min: 1, max: 30});
		this._constitutionFilter = new RangeFilter({header: "Constitution", cnHeader: "体质", min: 1, max: 30});
		this._intelligenceFilter = new RangeFilter({header: "Intelligence", cnHeader: "智力", min: 1, max: 30});
		this._wisdomFilter = new RangeFilter({header: "Wisdom", cnHeader: "感知", min: 1, max: 30});
		this._charismaFilter = new RangeFilter({header: "Charisma", cnHeader: "魅力", min: 1, max: 30});
		this._abilityScoreFilter = new MultiFilter({
			header: "Ability Scores",
			cnHeader: "属性值",
			filters: [this._strengthFilter, this._dexterityFilter, this._constitutionFilter, this._intelligenceFilter, this._wisdomFilter, this._charismaFilter],
			isAddDropdownToggle: true,
		});
		this._acFilter = new RangeFilter({header: "Armor Class", cnHeader: "护甲等级"});
		this._averageHpFilter = new RangeFilter({header: "Average Hit Points", cnHeader: "平均生命值"});
		this._typeFilter = new Filter({
			header: "Type",
			cnHeader: "生物类型",
			items: [...Parser.MON_TYPES],
			displayFn: StrUtil.toTitleCase,
			itemSortFn: SortUtil.ascSortLower,
		});
		this._tagFilter = new Filter({header: "Tag", cnHeader:"类型副标", displayFn: it => Parser.MON_TAG_TO_CN[it] || StrUtil.toTitleCase(it)});
		this._sidekickTypeFilter = new Filter({
			header: "Sidekick Type",
			cnHeader: "协力者类型",
			items: ["expert", "spellcaster", "warrior"],
			displayFn: it => Parser.MON_SIDEKICK_TO_CN[it] || StrUtil.toTitleCase(it),
			itemSortFn: SortUtil.ascSortLower,
		});
		this._sidekickTagFilter = new Filter({header: "Sidekick Tag", cnHeader: "协力者类型副标", displayFn: StrUtil.toTitleCase});
		this._alignmentFilter = new Filter({
			header: "Alignment",
			cnHeader: "阵营",
			items: ["L", "NX", "C", "G", "NY", "E", "N", "U", "A", "No Alignment"],
			displayFn: alignment => Parser.alignmentAbvToFull(alignment).toTitleCase(),
			itemSortFn: null,
		});
		this._languageFilter = new Filter({
			header: "Languages",
			cnHeader: "语言",
			displayFn: (k) => Parser.monLanguageTagToFull(k).toTitleCase(),
			umbrellaItems: ["X", "XX"],
			umbrellaExcludes: ["CS"],
		});
		this._damageTypeFilterBase = new Filter({
			header: "Damage Inflicted by Traits/Actions",
			cnHeader: "通过特性/动作造成伤害",
			displayFn: this.constructor._getDamageTagDisplayText,
			displayFnMini: tag => `Deals ${this.constructor._getDamageTagDisplayText(tag)} (Trait/Action)`,
			items: Object.keys(Parser.DMGTYPE_JSON_TO_FULL),
		});
		this._damageTypeFilterLegendary = new Filter({
			header: "Damage Inflicted by Lair Actions/Regional Effects",
			cnHeader: "通过巢穴动作/区域效应造成伤害",
			displayFn: this.constructor._getDamageTagDisplayText,
			displayFnMini: tag => `Deals ${this.constructor._getDamageTagDisplayText(tag)} (Lair/Regional)`,
			items: Object.keys(Parser.DMGTYPE_JSON_TO_FULL),
		});
		this._damageTypeFilterSpells = new Filter({
			header: "Damage Inflicted by Spells",
			cnHeader: "通过法术造成伤害",
			displayFn: this.constructor._getDamageTagDisplayText,
			displayFnMini: tag => `Deals ${this.constructor._getDamageTagDisplayText(tag)} (Spell)`,
			items: Object.keys(Parser.DMGTYPE_JSON_TO_FULL),
		});
		this._damageTypeFilter = new MultiFilter({header: "Damage Inflicted", cnHeader: "造成伤害", filters: [this._damageTypeFilterBase, this._damageTypeFilterLegendary, this._damageTypeFilterSpells]});
		this._conditionsInflictedFilterBase = new Filter({
			header: "Conditions Inflicted by Traits/Actions",
			cnHeader: "通过特性/动作造成状态",
			displayFn: this.constructor._getConditionDisplayText,
			displayFnMini: uid => `Inflicts ${this.constructor._getConditionDisplayText(uid)} (Trait/Action)`,
			items: [...Parser.CONDITIONS],
		});
		this._conditionsInflictedFilterLegendary = new Filter({
			header: "Conditions Inflicted by Lair Actions/Regional Effects",
			cnHeader: "通过巢穴动作/区域效应造成状态",
			displayFn: this.constructor._getConditionDisplayText,
			displayFnMini: uid => `Inflicts ${this.constructor._getConditionDisplayText(uid)} (Lair/Regional)`,
			items: [...Parser.CONDITIONS],
		});
		this._conditionsInflictedFilterSpells = new Filter({
			header: "Conditions Inflicted by Spells",
			cnHeader: "通过法术造成状态",
			displayFn: this.constructor._getConditionDisplayText,
			displayFnMini: uid => `Inflicts ${this.constructor._getConditionDisplayText(uid)} (Spell)`,
			items: [...Parser.CONDITIONS],
		});
		this._conditionsInflictedFilter = new MultiFilter({header: "Conditions Inflicted", cnHeader: "造成状态", filters: [this._conditionsInflictedFilterBase, this._conditionsInflictedFilterLegendary, this._conditionsInflictedFilterSpells]});
		this._savingThrowForcedFilterBase = new Filter({
			header: "Saving Throws Required by Traits/Actions",
			cnHeader: "特性/动作需要的豁免检定",
			displayFn: this.constructor._getAbilitySaveDisplayText,
			displayFnMini: abl => `Requires ${this.constructor._getAbilitySaveDisplayText(abl)} (Trait/Action)`,
			items: Parser.ABIL_ABVS.map(abl => Parser.attAbvToFull(abl).toLowerCase()),
			itemSortFn: null,
		});
		this._savingThrowForcedFilterLegendary = new Filter({
			header: "Saving Throws Required by Lair Actions/Regional Effects",
			cnHeader: "通过巢穴动作/区域效应需要的豁免检定",
			displayFn: this.constructor._getAbilitySaveDisplayText,
			displayFnMini: abl => `Requires ${this.constructor._getAbilitySaveDisplayText(abl)} (Lair/Regional)`,
			items: Parser.ABIL_ABVS.map(abl => Parser.attAbvToFull(abl).toLowerCase()),
			itemSortFn: null,
		});
		this._savingThrowForcedFilterSpells = new Filter({
			header: "Saving Throws Required by Spells",
			cnHeader: "法术需要的豁免检定",
			displayFn: this.constructor._getAbilitySaveDisplayText,
			displayFnMini: abl => `Requires ${this.constructor._getAbilitySaveDisplayText(abl)} (Spell)`,
			items: Parser.ABIL_ABVS.map(abl => Parser.attAbvToFull(abl).toLowerCase()),
			itemSortFn: null,
		});
		this._savingThrowForcedFilter = new MultiFilter({header: "Saving Throw Required", cnHeader:"需要豁免检定", filters: [this._savingThrowForcedFilterBase, this._savingThrowForcedFilterLegendary, this._savingThrowForcedFilterSpells]});
		this._senseFilter = new Filter({
			header: "Senses",
			cnHeader: "感官能力",
			displayFn: (it) => Parser.monSenseTagToFull(it).toTitleCase(),
			items: ["B", "D", "SD", "T", "U"],
			itemSortFn: SortUtil.ascSortLower,
		});
		this._passivePerceptionFilter = new RangeFilter({header: "Passive Perception", cnHeader:"被动感知", min: 10, max: 10});
		this._skillFilter = new Filter({
			header: "Skills",
			cnHeader: "技能",
			displayFn: (it) => it.toTitleCase(),
			items: Object.keys(Parser.SKILL_TO_ATB_ABV),
		});
		this._saveFilter = new Filter({
			header: "Saves",
			cnHeader: "豁免",
			displayFn: Parser.attAbvToFull,
			items: [...Parser.ABIL_ABVS],
			itemSortFn: null,
		});
		this._environmentFilter = new Filter({
			header: "Environment",
			cnHeader: "环境",
			items: ["arctic", "coastal", "desert", "forest", "grassland", "hill", "mountain", "none", "swamp", "underdark", "underwater", "urban"],
			displayFn: StrUtil.uppercaseFirst,
		});
		this._vulnerableFilter = FilterCommon.getDamageVulnerableFilter();
		this._resistFilter = FilterCommon.getDamageResistFilter();
		this._immuneFilter = FilterCommon.getDamageImmuneFilter();
		this._defenceFilter = new MultiFilter({header: "Damage", cnHeader:"伤害", filters: [this._vulnerableFilter, this._resistFilter, this._immuneFilter]});
		this._conditionImmuneFilter = FilterCommon.getConditionImmuneFilter();
		this._traitFilter = new Filter({
			header: "Traits",
			cnHeader: "特性",
			items: [
				"好斗", "伏击", "无定形", "水陆两栖", "魔力依赖", "残暴", "冲锋", "伤害吸收", "自爆", "魔鬼视界", "拟形", "精类血统", "飞掠", "屏息", "照明", "不变形态", "虚体移动", "敏锐感官", "传奇抗性", "光照敏感", "魔法抗性", "魔法武器", "集群战术", "猛扑", "横行", "鲁莽", "再生", "复生", "变形生物", "攻城怪物", "偷袭", "蛛行", "日照敏感", "掘道者", "免疫驱散", "抵抗驱散", "不死坚韧", "水下呼吸", "蛛网感知", "蛛网行者",
			],
		});
		this._actionReactionFilter = new Filter({
			header: "Actions & Reactions",
			cnHeader: "动作 & 反应",
			items: [
				"Frightful Presence", "Multiattack", "Parry", "Swallow", "Teleport", "Tentacles",
			],
		});
		this._miscFilter = new Filter({
			header: "Miscellaneous",
			cnHeader: "杂项",
			items: ["Familiar", ...Object.keys(Parser.MON_MISC_TAG_TO_FULL), "Bonus Actions", "Lair Actions", "Legendary", "Mythic", "Adventure NPC", "Spellcaster", ...Object.values(Parser.ATB_ABV_TO_FULL).map(it => `${PageFilterBestiary.MISC_FILTER_SPELLCASTER}${it}`), "Regional Effects", "Reactions", "重置", "Swarm", "Has Variants", "Modified Copy", "Has Alternate Token", "有简介", "有图片", "Has Token", "Has Recharge", "SRD", "基础规则", "传奇", "AC from Item(s)", "AC from Natural Armor", "AC from Unarmored Defense", "Summoned by Spell", "Summoned by Class"],
			displayFn: (it) => Parser.monMiscTagToFull(it).uppercaseFirst(),
			deselFn: (it) => ["Adventure NPC", "重置"].includes(it),
			itemSortFn: PageFilterBestiary.ascSortMiscFilter,
			isMiscFilter: true,
		});
		this._spellcastingTypeFilter = new Filter({
			header: "Spellcasting Type",
			cnHeader: "施法类型",
			items: ["F", "I", "P", "S", "O", "CA", "CB", "CC", "CD", "CP", "CR", "CS", "CL", "CW"],
			displayFn: Parser.monSpellcastingTagToFull,
		});
		this._spellSlotLevelFilter = new RangeFilter({
			header: "Spell Slot Level",
			cnHeader: "法术环阶",
			min: 1,
			max: 9,
			displayFn: it => Parser.getOrdinalForm(it),
		});
		this._spellKnownFilter = new SearchableFilter({header: "Spells Known",cnHeader:"已知法术", displayFn: (it) => it.split("|")[0].toTitleCase(), itemSortFn: SortUtil.ascSortLower});
		this._equipmentFilter = new SearchableFilter({header: "Equipment", cnHeader: "装备", displayFn: (it) => it.split("|")[0].toTitleCase(), itemSortFn: SortUtil.ascSortLower});
		this._dragonAgeFilter = new Filter({
			header: "Dragon Age",
			cnHeader: "龙的年龄",
			items: [...PageFilterBestiary._DRAGON_AGES],
			itemSortFn: PageFilterBestiary._ascSortDragonAgeFilter,
			displayFn: (it) => it.toTitleCase(),
		});
		this._dragonCastingColor = new Filter({
			header: "Dragon Casting Color",
			cnHeader: "龙的颜色",
			items: [...Renderer.monster.dragonCasterVariant.getAvailableColors()],
			displayFn: (it) => it.toTitleCase(),
		});
	}

	static mutateForFilters (mon) {
		Renderer.monster.initParsed(mon);

		this._mutateForFilters_speed(mon);

		mon._fAc = (mon.ac || []).map(it => it.special ? null : (it.ac || it)).filter(it => it !== null);
		if (!mon._fAc.length) mon._fAc = null;
		mon._fHp = mon.hp?.average ?? null;
		if (mon.alignment) {
			const tempAlign = typeof mon.alignment[0] === "object"
				? Array.prototype.concat.apply([], mon.alignment.map(a => a.alignment))
				: [...mon.alignment];
			if (tempAlign.includes("N") && !tempAlign.includes("G") && !tempAlign.includes("E")) tempAlign.push("NY");
			else if (tempAlign.includes("N") && !tempAlign.includes("L") && !tempAlign.includes("C")) tempAlign.push("NX");
			else if (tempAlign.length === 1 && tempAlign.includes("N")) Array.prototype.push.apply(tempAlign, PageFilterBestiary._NEUT_ALIGNS);
			mon._fAlign = tempAlign;
		} else {
			mon._fAlign = ["No Alignment"];
		}
		mon._fEnvironment = mon.environment || ["none"];
		mon._fVuln = mon.vulnerable ? PageFilterBestiary.getAllImmRest(mon.vulnerable, "vulnerable") : [];
		mon._fRes = mon.resist ? PageFilterBestiary.getAllImmRest(mon.resist, "resist") : [];
		mon._fImm = mon.immune ? PageFilterBestiary.getAllImmRest(mon.immune, "immune") : [];
		mon._fCondImm = mon.conditionImmune ? PageFilterBestiary.getAllImmRest(mon.conditionImmune, "conditionImmune") : [];
		mon._fSave = mon.save ? Object.keys(mon.save) : [];
		mon._fSkill = mon.skill ? Object.keys(mon.skill) : [];
		mon._fSources = SourceFilter.getCompleteFilterSources(mon);
		mon._fPassive = !isNaN(mon.passive) ? Number(mon.passive) : null;

		Parser.ABIL_ABVS
			.forEach(ab => {
				if (mon[ab] == null) return;
				const propF = `_f${ab.uppercaseFirst()}`;
				mon[propF] = typeof mon[ab] !== "number" ? null : mon[ab];
			});

		mon._fMisc = [...mon.miscTags || []];
		for (const it of (mon.trait || [])) {
			if (it.name && it.name.startsWith("Unarmored Defense")) mon._fMisc.push("AC from Unarmored Defense");
		}
		for (const it of (mon.ac || [])) {
			if (!it.from) continue;
			if (it.from.includes("natural armor")) mon._fMisc.push("AC from Natural Armor");
			if (it.from.some(x => x.startsWith("{@item "))) mon._fMisc.push("AC from Item(s)");
			if (!mon._fMisc.includes("AC from Unarmored Defense") && it.from.includes("Unarmored Defense")) mon._fMisc.push("AC from Unarmored Defense");
		}
		if (mon.legendary) mon._fMisc.push("Legendary");
		if (mon.familiar) mon._fMisc.push("Familiar");
		if (mon.type.swarmSize) mon._fMisc.push("Swarm");
		if (mon.spellcasting) {
			mon._fMisc.push("Spellcaster");
			for (const sc of mon.spellcasting) {
				if (sc.ability) mon._fMisc.push(`${PageFilterBestiary.MISC_FILTER_SPELLCASTER}${Parser.attAbvToFull(sc.ability)}`);
			}
		}
		if (mon.isNpc) mon._fMisc.push("Adventure NPC");
		const legGroup = DataUtil.monster.getMetaGroup(mon);
		if (legGroup) {
			if (legGroup.lairActions) mon._fMisc.push("Lair Actions");
			if (legGroup.regionalEffects) mon._fMisc.push("Regional Effects");
		}
		if (mon.reaction) mon._fMisc.push("Reactions");
		if (mon.bonus) mon._fMisc.push("Bonus Actions");
		if (mon.variant) mon._fMisc.push("Has Variants");
		if (mon._isCopy) mon._fMisc.push("Modified Copy");
		if (mon.altArt) mon._fMisc.push("Has Alternate Token");
		if (mon.srd) mon._fMisc.push("SRD");
		if (mon.basicRules) mon._fMisc.push("基础规则");
		if (SourceUtil.isLegacySourceWotc(mon.source)) mon._fMisc.push("传奇");
		if (Renderer.monster.hasToken(mon)) mon._fMisc.push("Has Token");
		if (mon.mythic) mon._fMisc.push("Mythic");
		if (this._hasFluff(mon)) mon._fMisc.push("有简介");
		if (this._hasFluffImages(mon)) mon._fMisc.push("有图片");
		if (this._isReprinted({reprintedAs: mon.reprintedAs, tag: "creature", prop: "monster", page: UrlUtil.PG_BESTIARY})) mon._fMisc.push("重置");
		if (this._hasRecharge(mon)) mon._fMisc.push("Has Recharge");
		if (mon._versionBase_isVersion) mon._fMisc.push("Is Variant");
		if (mon.summonedBySpell) mon._fMisc.push("Summoned by Spell");
		if (mon.summonedByClass) mon._fMisc.push("Summoned by Class");

		const spellcasterMeta = this._getSpellcasterMeta(mon);
		if (spellcasterMeta) {
			if (spellcasterMeta.spellLevels.size) mon._fSpellSlotLevels = [...spellcasterMeta.spellLevels];
			if (spellcasterMeta.spellSet.size) mon._fSpellsKnown = [...spellcasterMeta.spellSet];
		}

		if (mon.languageTags?.length) mon._fLanguageTags = mon.languageTags;
		else mon._fLanguageTags = ["None"];

		mon._fEquipment = this._getEquipmentList(mon);
	}

	static _mutateForFilters_speed (mon) {
		if (mon.speed == null) {
			mon._fSpeedType = [];
			mon._fSpeed = null;
			return;
		}

		if (typeof mon.speed === "number" && mon.speed > 0) {
			mon._fSpeedType = ["walk"];
			mon._fSpeed = mon.speed;
			return;
		}

		mon._fSpeedType = Object.keys(mon.speed).filter(k => mon.speed[k]);
		if (mon._fSpeedType.length) mon._fSpeed = mon._fSpeedType.map(k => mon.speed[k].number || mon.speed[k]).filter(it => !isNaN(it)).sort((a, b) => SortUtil.ascSort(b, a))[0];
		else mon._fSpeed = 0;
		if (mon.speed.canHover) mon._fSpeedType.push("hover");
	}

	/* -------------------------------------------- */

	static _getInitWalker () {
		return PageFilterBestiary._WALKER = PageFilterBestiary._WALKER || MiscUtil.getWalker({isNoModification: true});
	}

	/* -------------------------------------------- */

	static _getSpellcasterMeta (mon) {
		if (!mon.spellcasting?.length) return null;

		const walker = this._getInitWalker();

		const spellSet = new Set();
		const spellLevels = new Set();
		for (const spc of mon.spellcasting) {
			if (spc.spells) {
				const slotLevels = Object.keys(spc.spells).map(Number).filter(Boolean);
				for (const slotLevel of slotLevels) spellLevels.add(slotLevel);
			}

			walker.walk(
				spc,
				{
					string: this._getSpellcasterMeta_stringHandler.bind(this, spellSet),
				},
			);
		}

		return {spellLevels, spellSet};
	}

	static _getSpellcasterMeta_stringHandler (spellSet, str) {
		str.replace(PageFilterBestiary._RE_SPELL_TAG, (...m) => {
			const parts = m[1].split("|").slice(0, 2);
			parts[1] = parts[1] || Parser.SRC_PHB;
			spellSet.add(parts.join("|").toLowerCase());
			return "";
		});
	}

	/* -------------------------------------------- */

	static _hasRecharge (mon) {
		for (const prop of PageFilterBestiary._BASIC_ENTRY_PROPS) {
			if (!mon[prop]) continue;
			for (const ent of mon[prop]) {
				if (!ent?.name) continue;
				if (ent.name.includes("{@recharge")) return true;
			}
		}
		return false;
	}

	/* -------------------------------------------- */

	static _getEquipmentList (mon) {
		const itemSet = new Set(mon.attachedItems || []);

		const walker = this._getInitWalker();

		for (const acItem of (mon.ac || [])) {
			if (!acItem?.from?.length) continue;
			for (const from of acItem.from) this._getEquipmentList_stringHandler(itemSet, from);
		}

		for (const trait of (mon.trait || [])) {
			if (!trait.name.toLowerCase().startsWith("special equipment")) continue;
			walker.walk(
				trait.entries,
				{
					string: this._getEquipmentList_stringHandler.bind(this, itemSet),
				},
			);
			break;
		}

		return [...itemSet];
	}

	static _getEquipmentList_stringHandler (itemSet, str) {
		str
			.replace(PageFilterBestiary._RE_ITEM_TAG, (...m) => {
				const unpacked = DataUtil.proxy.unpackUid("item", m[1], "item", {isLower: true});
				itemSet.add(DataUtil.proxy.getUid("item", unpacked));
				return "";
			});
	}

	/* -------------------------------------------- */

	addToFilters (mon, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(mon._fSources);
		this._crFilter.addItem(mon._fCr);
		this._strengthFilter.addItem(mon._fStr);
		this._dexterityFilter.addItem(mon._fDex);
		this._constitutionFilter.addItem(mon._fCon);
		this._intelligenceFilter.addItem(mon._fInt);
		this._wisdomFilter.addItem(mon._fWis);
		this._charismaFilter.addItem(mon._fCha);
		this._speedFilter.addItem(mon._fSpeed);
		(mon.ac || []).forEach(it => this._acFilter.addItem(it.ac || it));
		if (mon.hp?.average) this._averageHpFilter.addItem(mon.hp.average);
		this._tagFilter.addItem(mon._pTypes.tags);
		this._sidekickTypeFilter.addItem(mon._pTypes.typeSidekick);
		this._sidekickTagFilter.addItem(mon._pTypes.tagsSidekick);
		this._traitFilter.addItem(mon.traitTags);
		this._actionReactionFilter.addItem(mon.actionTags);
		this._environmentFilter.addItem(mon._fEnvironment);
		this._vulnerableFilter.addItem(mon._fVuln);
		this._resistFilter.addItem(mon._fRes);
		this._immuneFilter.addItem(mon._fImm);
		this._senseFilter.addItem(mon.senseTags);
		this._passivePerceptionFilter.addItem(mon._fPassive);
		this._spellSlotLevelFilter.addItem(mon._fSpellSlotLevels);
		this._spellKnownFilter.addItem(mon._fSpellsKnown);
		this._equipmentFilter.addItem(mon._fEquipment);
		if (mon._versionBase_isVersion) this._miscFilter.addItem("Is Variant");
		this._damageTypeFilterBase.addItem(mon.damageTags);
		this._damageTypeFilterLegendary.addItem(mon.damageTagsLegendary);
		this._damageTypeFilterSpells.addItem(mon.damageTagsSpell);
		this._conditionsInflictedFilterBase.addItem(mon.conditionInflict);
		this._conditionsInflictedFilterLegendary.addItem(mon.conditionInflictLegendary);
		this._conditionsInflictedFilterSpells.addItem(mon.conditionInflictSpell);
		this._savingThrowForcedFilterBase.addItem(mon.savingThrowForced);
		this._savingThrowForcedFilterLegendary.addItem(mon.savingThrowForcedLegendary);
		this._savingThrowForcedFilterSpells.addItem(mon.savingThrowForcedSpell);
		this._dragonAgeFilter.addItem(mon.dragonAge);
		this._dragonCastingColor.addItem(mon.dragonCastingColor);
	}

	async _pPopulateBoxOptions (opts) {
		Object.entries(Parser.MON_LANGUAGE_TAG_TO_FULL)
			.sort(([, vA], [, vB]) => SortUtil.ascSortLower(vA, vB))
			.forEach(([k]) => this._languageFilter.addItem(k));
		this._languageFilter.addItem("None");

		opts.filters = [
			this._sourceFilter,
			this._crFilter,
			this._typeFilter,
			this._tagFilter,
			this._sidekickTypeFilter,
			this._sidekickTagFilter,
			this._environmentFilter,
			this._defenceFilter,
			this._conditionImmuneFilter,
			this._traitFilter,
			this._actionReactionFilter,
			this._miscFilter,
			this._spellcastingTypeFilter,
			this._spellSlotLevelFilter,
			this._sizeFilter,
			this._speedFilter,
			this._speedTypeFilter,
			this._alignmentFilter,
			this._saveFilter,
			this._skillFilter,
			this._senseFilter,
			this._passivePerceptionFilter,
			this._languageFilter,
			this._damageTypeFilter,
			this._conditionsInflictedFilter,
			this._savingThrowForcedFilter,
			this._dragonAgeFilter,
			this._dragonCastingColor,
			this._acFilter,
			this._averageHpFilter,
			this._abilityScoreFilter,
			this._spellKnownFilter,
			this._equipmentFilter,
		];
	}

	toDisplay (values, m) {
		return this._filterBox.toDisplay(
			values,
			m._fSources,
			m._fCr,
			m._pTypes.types,
			m._pTypes.tags,
			m._pTypes.typeSidekick,
			m._pTypes.tagsSidekick,
			m._fEnvironment,
			[
				m._fVuln,
				m._fRes,
				m._fImm,
			],
			m._fCondImm,
			m.traitTags,
			m.actionTags,
			m._fMisc,
			m.spellcastingTags,
			m._fSpellSlotLevels,
			m.size,
			m._fSpeed,
			m._fSpeedType,
			m._fAlign,
			m._fSave,
			m._fSkill,
			m.senseTags,
			m._fPassive,
			m._fLanguageTags,
			[
				m.damageTags,
				m.damageTagsLegendary,
				m.damageTagsSpell,
			],
			[
				m.conditionInflict,
				m.conditionInflictLegendary,
				m.conditionInflictSpell,
			],
			[
				m.savingThrowForced,
				m.savingThrowForcedLegendary,
				m.savingThrowForcedSpell,
			],
			m.dragonAge,
			m.dragonCastingColor,
			m._fAc,
			m._fHp,
			[
				m._fStr,
				m._fDex,
				m._fCon,
				m._fInt,
				m._fWis,
				m._fCha,
			],
			m._fSpellsKnown,
			m._fEquipment,
		);
	}
}

globalThis.PageFilterBestiary = PageFilterBestiary;

class ModalFilterBestiary extends ModalFilterBase {
	/**
	 * @param opts
	 * @param opts.namespace
	 * @param [opts.isRadio]
	 * @param [opts.allData]
	 */
	constructor (opts) {
		opts = opts || {};
		super({
			...opts,
			modalTitle: `Creature${opts.isRadio ? "" : "s"}`,
			pageFilter: new PageFilterBestiary(),
			fnSort: PageFilterBestiary.sortMonsters,
		});
	}

	_$getColumnHeaders () {
		const btnMeta = [
			{sort: "name", text: "Name", width: "4"},
			{sort: "type", text: "Type", width: "4"},
			{sort: "cr", text: "CR", width: "2"},
			{sort: "source", text: "来源", width: "1"},
		];
		return ModalFilterBase._$getFilterColumnHeaders(btnMeta);
	}

	async _pLoadAllData () {
		return [
			...(await DataUtil.monster.pLoadAll()),
			...((await PrereleaseUtil.pGetBrewProcessed()).monster || []),
			...((await BrewUtil2.pGetBrewProcessed()).monster || []),
		];
	}

	_getListItem (pageFilter, mon, itI) {
		Renderer.monster.initParsed(mon);
		pageFilter.mutateAndAddToFilters(mon);

		const eleRow = document.createElement("div");
		eleRow.className = "px-0 w-100 ve-flex-col no-shrink";

		const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BESTIARY](mon);
		const source = Parser.sourceJsonToAbv(mon.source);
		const type = mon._pTypes.asText;
		const cr = mon._pCr;

		eleRow.innerHTML = `<div class="w-100 ve-flex-vh-center lst--border veapp__list-row no-select lst__wrp-cells">
			<div class="ve-col-0-5 pl-0 ve-flex-vh-center">${this._isRadio ? `<input type="radio" name="radio" class="no-events">` : `<input type="checkbox" class="no-events">`}</div>

			<div class="ve-col-0-5 px-1 ve-flex-vh-center">
				<div class="ui-list__btn-inline px-2" title="Toggle Preview (SHIFT to Toggle Info Preview)">[+]</div>
			</div>

			<div class="ve-col-4 ${mon._versionBase_isVersion ? "italic" : ""} ${this._getNameStyle()}">${mon._versionBase_isVersion ? `<span class="px-3"></span>` : ""}${mon.name}</div>
			<div class="ve-col-4">${type}</div>
			<div class="ve-col-2 ve-text-center">${cr}</div>
			<div class="ve-col-1 ve-flex-h-center ${Parser.sourceJsonToSourceClassname(mon.source)} pr-0" title="${Parser.sourceJsonToFull(mon.source)}" ${Parser.sourceJsonToStyle(mon.source)}>${source}${Parser.sourceJsonToMarkerHtml(mon.source)}</div>
		</div>`;

		const btnShowHidePreview = eleRow.firstElementChild.children[1].firstElementChild;

		const listItem = new ListItem(
			itI,
			eleRow,
			mon.name,
			{
				hash,
				source,
				sourceJson: mon.source,
				type,
				cr,
				ENG_name: mon.ENG_name,
			},
			{
				cbSel: eleRow.firstElementChild.firstElementChild.firstElementChild,
				btnShowHidePreview,
			},
		);

		ListUiUtil.bindPreviewButton(UrlUtil.PG_BESTIARY, this._allData, listItem, btnShowHidePreview);

		return listItem;
	}
}

globalThis.ModalFilterBestiary = ModalFilterBestiary;

class ListSyntaxBestiary extends ListUiUtil.ListSyntax {
	static _INDEXABLE_PROPS_ENTRIES = [
		"trait",
		"spellcasting",
		"action",
		"bonus",
		"reaction",
		"legendary",
		"mythic",
		"variant",
	];
	static _INDEXABLE_PROPS_LEG_GROUP = [
		"lairActions",
		"regionalEffects",
		"mythicEncounter",
	];

	_getSearchCacheStats (entity) {
		const legGroup = DataUtil.monster.getMetaGroup(entity);
		if (!legGroup && this.constructor._INDEXABLE_PROPS_ENTRIES.every(it => !entity[it])) return "";
		const ptrOut = {_: ""};
		this.constructor._INDEXABLE_PROPS_ENTRIES.forEach(it => this._getSearchCache_handleEntryProp(entity, it, ptrOut));
		if (legGroup) this.constructor._INDEXABLE_PROPS_LEG_GROUP.forEach(it => this._getSearchCache_handleEntryProp(legGroup, it, ptrOut));
		return ptrOut._;
	}
}

globalThis.ListSyntaxBestiary = ListSyntaxBestiary;
