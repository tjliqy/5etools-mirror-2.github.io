"use strict";

class PageFilterFeats extends PageFilterBase {
	// region static
	static _PREREQ_KEYs_OTHER_IGNORED = new Set(["level"]);
	// endregion

	constructor () {
		super();

		this._categoryFilter = new Filter({
			header: "Category",
			cnHeader:"分类",
			displayFn: Parser.featCategoryToFull,
			items: [...Object.keys(Parser.FEAT_CATEGORY_TO_FULL), "其他"],
		});
		this._asiFilter = new Filter({
			header: "Ability Bonus",
			cnHeader:"属性加值",
			items: [
				"str",
				"dex",
				"con",
				"int",
				"wis",
				"cha",
			],
			displayFn: Parser.attAbvToFull,
			itemSortFn: null,
		});
		this._otherPrereqFilter = new Filter({
			header: "Other",
			cnHeader: "其他",
			items: [...FilterCommon.PREREQ_FILTER_ITEMS],
			displayFn: function(tag){
				switch(tag){
					case "Ability": 	return "属性值";
					case "Race": 		return "种族";
					case "Proficiency": return "熟练";
					case "Spellcasting":return "施法";
					case "Background":  return "背景";
					case "Campaign":    return "战役";
					case "Feat":        return "专长";
					case "Psionics":    return "灵能";
					case "Special":     return "特殊";
					default: return tag;
				}
			},
		});
		this._levelFilter = new Filter({
			header: "Level",
			cnHeader: "等级",
			itemSortFn: SortUtil.ascSortNumericalSuffix,
		});
		this._prerequisiteFilter = new MultiFilter({header: "Prerequisite", cnHeader:"先决条件", filters: [this._otherPrereqFilter, this._levelFilter]});
		this._benefitsFilter = new Filter({
			header: "Benefits",
			cnHeader: "增益",
			items: [
				"护甲熟练项",
				"语言熟练项",
				"技能熟练项",
				"施法",
				"工具熟练项",
				"武器熟练项",
			],
		});
		this._vulnerableFilter = FilterCommon.getDamageVulnerableFilter();
		this._resistFilter = FilterCommon.getDamageResistFilter();
		this._immuneFilter = FilterCommon.getDamageImmuneFilter();
		this._defenseFilter = new MultiFilter({header: "Damage", cnHeader:"伤害", filters: [this._vulnerableFilter, this._resistFilter, this._immuneFilter]});
		this._conditionImmuneFilter = FilterCommon.getConditionImmuneFilter();
		this._miscFilter = new Filter({
			header: "Miscellaneous",
			cnHeader:"杂项",
			items: ["有简介", "有图片", "传奇"],
			isMiscFilter: true,
			deselFn: PageFilterBase.defaultMiscellaneousDeselFn.bind(PageFilterBase),
		});
	}

	static mutateForFilters (feat) {
		const ability = Renderer.getAbilityData(feat.ability);
		feat._fAbility = ability.asCollection.filter(a => !ability.areNegative.includes(a)); // used for filtering

		feat._fCategory = feat.category || "其他";

		const prereqText = Renderer.utils.prerequisite.getHtml(feat.prerequisite, {isListMode: true}) || VeCt.STR_NONE;

		feat._fPrereqOther = FilterCommon.getFilterValuesPrerequisite(feat.prerequisite, {ignoredKeys: this._PREREQ_KEYs_OTHER_IGNORED});
		feat._fPrereqLevel = feat.prerequisite
			? feat.prerequisite
				.filter(it => it.level != null)
				.map(it => `${it.level.level ?? it.level} 级`)
			: [];
		feat._fBenifits = [
			...(feat.traitTags || []),
			feat.resist ? "伤害抗性" : null,
			feat.immune ? "Damage Immunity" : null,
			feat.conditionImmune ? "Condition Immunity" : null,
			feat.skillProficiencies ? "技能熟练项" : null,
			feat.additionalSpells ? "施法" : null,
			feat.armorProficiencies ? "护甲熟练项" : null,
			feat.weaponProficiencies ? "武器熟练项" : null,
			feat.toolProficiencies ? "工具熟练项" : null,
			feat.languageProficiencies ? "语言熟练项" : null,
		].filter(it => it);
		if (feat.skillToolLanguageProficiencies?.length) {
			if (feat.skillToolLanguageProficiencies.some(it => (it.choose || []).some(x => x.from || [].includes("anySkill")))) feat._fBenifits.push("技能熟练项");
			if (feat.skillToolLanguageProficiencies.some(it => (it.choose || []).some(x => x.from || [].includes("anyTool")))) feat._fBenifits.push("工具熟练项");
			if (feat.skillToolLanguageProficiencies.some(it => (it.choose || []).some(x => x.from || [].includes("anyLanguage")))) feat._fBenifits.push("语言熟练项");
		}
		this._mutateForFilters_commonMisc(feat);
		if (feat.repeatable != null) feat._fMisc.push(feat.repeatable ? "Repeatable" : "Not Repeatable");

		feat._slAbility = ability.asTextShort || VeCt.STR_NONE;
		feat._slPrereq = prereqText;

		FilterCommon.mutateForFilters_damageVulnResImmune_player(feat);
		FilterCommon.mutateForFilters_conditionImmune_player(feat);
	}

	addToFilters (feat, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(feat.source);
		this._categoryFilter.addItem(feat.category);
		this._levelFilter.addItem(feat._fPrereqLevel);
		this._otherPrereqFilter.addItem(feat._fPrereqOther);
		this._vulnerableFilter.addItem(feat._fVuln);
		this._resistFilter.addItem(feat._fRes);
		this._immuneFilter.addItem(feat._fImm);
		this._conditionImmuneFilter.addItem(feat._fCondImm);
		this._benefitsFilter.addItem(feat._fBenifits);
		this._miscFilter.addItem(feat._fMisc);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._categoryFilter,
			this._asiFilter,
			this._prerequisiteFilter,
			this._benefitsFilter,
			this._defenseFilter,
			this._conditionImmuneFilter,
			this._miscFilter,
		];
	}

	toDisplay (values, ft) {
		return this._filterBox.toDisplay(
			values,
			ft.source,
			ft._fCategory,
			ft._fAbility,
			[
				ft._fPrereqOther,
				ft._fPrereqLevel,
			],
			ft._fBenifits,
			[
				ft._fVuln,
				ft._fRes,
				ft._fImm,
			],
			ft._fCondImm,
			ft._fMisc,
		);
	}
}

globalThis.PageFilterFeats = PageFilterFeats;

class ModalFilterFeats extends ModalFilterBase {
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
			modalTitle: `Feat${opts.isRadio ? "" : "s"}`,
			pageFilter: new PageFilterFeats(),
		});
	}

	_$getColumnHeaders () {
		const btnMeta = [
			{sort: "name", text: "名称", width: "3-5"},
			{sort: "category", text: "分类", width: "1-5"},
			{sort: "ability", text: "属性值", width: "2"},
			{sort: "prerequisite", text: "先决条件", width: "3"},
			{sort: "source", text: "来源", width: "1"},
		];
		return ModalFilterBase._$getFilterColumnHeaders(btnMeta);
	}

	async _pLoadAllData () {
		return [
			...(await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/feats.json`)).feat,
			...((await PrereleaseUtil.pGetBrewProcessed()).feat || []),
			...((await BrewUtil2.pGetBrewProcessed()).feat || []),
		];
	}

	_getListItem (pageFilter, feat, ftI) {
		const eleRow = document.createElement("div");
		eleRow.className = "px-0 w-100 ve-flex-col no-shrink";

		const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_FEATS](feat);
		const source = Parser.sourceJsonToAbv(feat.source);

		eleRow.innerHTML = `<div class="w-100 ve-flex-vh-center lst__row-border veapp__list-row no-select lst__wrp-cells">
			<div class="ve-col-0-5 pl-0 ve-flex-vh-center">${this._isRadio ? `<input type="radio" name="radio" class="no-events">` : `<input type="checkbox" class="no-events">`}</div>

			<div class="ve-col-0-5 px-1 ve-flex-vh-center">
				<div class="ui-list__btn-inline px-2 no-select" title="Toggle Preview (SHIFT to Toggle Info Preview)">[+]</div>
			</div>

			<div class="ve-col-3-5 px-1 ${feat._versionBase_isVersion ? "italic" : ""} ${this._getNameStyle()}">${feat._versionBase_isVersion ? `<span class="px-3"></span>` : ""}${feat.name}</div>
			<span class="ve-col-1-5 px-1 ve-text-center ${feat.category == null ? "italic" : ""}" ${feat.category ? `title="${Parser.featCategoryToFull(feat.category).qq()}"` : ""}>${feat.category || "\u2014"}</span>
			<span class="ve-col-2 px-1 ${feat._slAbility === VeCt.STR_NONE ? "italic" : ""}">${feat._slAbility}</span>
			<span class="ve-col-3 px-1 ${feat._slPrereq === VeCt.STR_NONE ? "italic" : ""}">${feat._slPrereq}</span>
			<div class="ve-col-1 pl-1 pr-0 ve-flex-h-center ${Parser.sourceJsonToSourceClassname(feat.source)}" title="${Parser.sourceJsonToFull(feat.source)}" ${Parser.sourceJsonToStyle(feat.source)}>${source}${Parser.sourceJsonToMarkerHtml(feat.source)}</div>
		</div>`;

		const btnShowHidePreview = eleRow.firstElementChild.children[1].firstElementChild;

		const listItem = new ListItem(
			ftI,
			eleRow,
			feat.name,
			{
				hash,
				source,
				sourceJson: feat.source,
				category: feat.category || "Other",
				ability: feat._slAbility,
				prerequisite: feat._slPrereq,
			},
			{
				cbSel: eleRow.firstElementChild.firstElementChild.firstElementChild,
				btnShowHidePreview,
			},
		);

		ListUiUtil.bindPreviewButton(UrlUtil.PG_FEATS, this._allData, listItem, btnShowHidePreview);

		return listItem;
	}
}

globalThis.ModalFilterFeats = ModalFilterFeats;
