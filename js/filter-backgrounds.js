"use strict";

class PageFilterBackgrounds extends PageFilterBase {
	// TODO(Future) expand/move to `Renderer.generic`
	static _getToolDisplayText (tool) {
		if (tool === "anyTool") return "任意工具";
		if (tool === "anyArtisansTool") return "任意工匠工具";
		if (tool === "anyMusicalInstrument") return "任意乐器";
		return Parser.TOOLS_TO_CN[tool] || tool.toTitleCase();
	}

	constructor () {
		super();

		this._asiFilter = new AbilityScoreFilter({header: "Ability Scores", cnHeader: "属性值"});
		this._skillFilter = new Filter({header: "Skill Proficiencies", cnHeader:"技能熟练项", displayFn: StrUtil.toTitleCase});
		this._prereqFilter = new Filter({
			header: "Prerequisite",
			cnHeader:"先决条件",
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
					case "Class":       return "职业";
					default: return tag;
				}
			},
			items: [...FilterCommon.PREREQ_FILTER_ITEMS],
		});
		this._toolFilter = new Filter({header: "工具熟练项", displayFn: PageFilterBackgrounds._getToolDisplayText.bind(PageFilterBackgrounds)});
		this._languageFilter = FilterCommon.getLanguageProficienciesFilter();
		this._otherBenefitsFilter = new Filter({header: "其他优势"});
		this._miscFilter = new Filter({
			header: "Miscellaneous",
			cnHeader: "杂项",
			items: ["有简介", "有图片", "传奇"],
			isMiscFilter: true,
			deselFn: PageFilterBase.defaultMiscellaneousDeselFn.bind(PageFilterBase),
		});
		this._featsFilter = new SearchableFilter({header: "Feats", itemSortFn: SortUtil.ascSortLower});
	}

	static _mutateForFilters_getFilterFeats (bg) {
		if (!bg.feats?.length) return null;
		return bg.feats
			.flatMap(obj => {
				return Object.entries(obj)
					.filter(([, v]) => v)
					.map(([k, v]) => {
						switch (k) {
							case "any": return "(Any)";
							case "anyFromCategory": return `(Any from ${Parser.featCategoryToFull(v.category)} Category)`;
							default: return k.split("|")[0].toTitleCase();
						}
					});
			});
	}

	static mutateForFilters (bg) {
		bg._fSources = SourceFilter.getCompleteFilterSources(bg);

		bg._fPrereq = FilterCommon.getFilterValuesPrerequisite(bg.prerequisite);

		bg.skillProficiencies = bg.skillProficiencies.map(skills => {
			let res = {};
			Object.keys(skills).map(skill=> {
				if (Parser.SKILL_TO_CN[skill]) {
					res[Parser.SKILL_TO_CN[skill]] = skills[skill];
				}else{
					res[skill] = skills[skill]
				}
			});
			return res;
			
		});

		const {summary: skillDisplay, collection: skills} = Renderer.generic.getSkillSummary({
			skillProfs: bg.skillProficiencies,
			skillToolLanguageProfs: bg.skillToolLanguageProficiencies,
			isShort: true,
		});
		bg._fSkills = skills;

		const {collection: tools} = Renderer.generic.getToolSummary({
			toolProfs: bg.toolProficiencies,
			skillToolLanguageProfs: bg.skillToolLanguageProficiencies,
			isShort: true,
		});
		bg._fTools = tools;

		const {collection: languages} = Renderer.generic.getLanguageSummary({
			languageProfs: bg.languageProficiencies,
			skillToolLanguageProfs: bg.skillToolLanguageProficiencies,
			isShort: true,
		});
		bg._fLangs = languages;

		this._mutateForFilters_commonMisc(bg);
		bg._fOtherBenifits = [];
		if (bg.feats) bg._fOtherBenifits.push("专长");
		if (bg.additionalSpells) bg._fOtherBenifits.push("额外法术");
		if (bg.armorProficiencies) bg._fOtherBenifits.push("护甲熟练项");
		if (bg.weaponProficiencies) bg._fOtherBenifits.push("武器熟练项");
		bg._skillDisplay = skillDisplay;

		const ability = Renderer.getAbilityData(bg.ability, {isOnlyShort: true, isBackgroundShortForm: bg.edition === "one"});
		bg._slAbility = ability.asTextShort || VeCt.STR_NONE;

		bg._fFeats = this._mutateForFilters_getFilterFeats(bg);
	}

	addToFilters (bg, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(bg._fSources);
		this._asiFilter.addItem(bg.ability);
		this._prereqFilter.addItem(bg._fPrereq);
		this._skillFilter.addItem(bg._fSkills);
		this._toolFilter.addItem(bg._fTools);
		this._languageFilter.addItem(bg._fLangs);
		this._otherBenefitsFilter.addItem(bg._fOtherBenifits);
		this._miscFilter.addItem(bg._fMisc);
		this._featsFilter.addItem(bg._fFeats);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._asiFilter,
			this._prereqFilter,
			this._skillFilter,
			this._toolFilter,
			this._languageFilter,
			this._otherBenefitsFilter,
			this._miscFilter,
			this._featsFilter,
		];
	}

	toDisplay (values, bg) {
		return this._filterBox.toDisplay(
			values,
			bg._fSources,
			bg.ability,
			bg._fPrereq,
			bg._fSkills,
			bg._fTools,
			bg._fLangs,
			bg._fOtherBenifits,
			bg._fMisc,
			bg._fFeats,
		);
	}
}

globalThis.PageFilterBackgrounds = PageFilterBackgrounds;

class ModalFilterBackgrounds extends ModalFilterBase {
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
			modalTitle: `Background${opts.isRadio ? "" : "s"}`,
			pageFilter: new PageFilterBackgrounds(),
		});
	}

	_$getColumnHeaders () {
		const btnMeta = [
			{sort: "name", text: "Name", width: "3"},
			{sort: "ability", text: "Ability", width: "4"},
			{sort: "skills", text: "Skills", width: "4"},
			{sort: "source", text: "Source", width: "1"},
		];
		return ModalFilterBase._$getFilterColumnHeaders(btnMeta);
	}

	async _pLoadAllData () {
		return [
			...(await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/backgrounds.json`)).background,
			...((await PrereleaseUtil.pGetBrewProcessed()).background || []),
			...((await BrewUtil2.pGetBrewProcessed()).background || []),
		];
	}

	_getListItem (pageFilter, bg, bgI) {
		const eleRow = document.createElement("div");
		eleRow.className = "px-0 w-100 ve-flex-col no-shrink";

		const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BACKGROUNDS](bg);
		const source = Parser.sourceJsonToAbv(bg.source);

		eleRow.innerHTML = `<div class="w-100 ve-flex-vh-center lst__row-border veapp__list-row no-select lst__wrp-cells">
			<div class="ve-col-0-5 pl-0 ve-flex-vh-center">${this._isRadio ? `<input type="radio" name="radio" class="no-events">` : `<input type="checkbox" class="no-events">`}</div>

			<div class="ve-col-0-5 px-1 ve-flex-vh-center">
				<div class="ui-list__btn-inline px-2 no-select" title="Toggle Preview (SHIFT to Toggle Info Preview)">[+]</div>
			</div>

			<div class="ve-col-3 px-1 ${bg._versionBase_isVersion ? "italic" : ""} ${this._getNameStyle()}">${bg._versionBase_isVersion ? `<span class="px-3"></span>` : ""}${bg.name}</div>
			<span class="ve-col-4 px-1 ${bg._slAbility === VeCt.STR_NONE ? "italic" : ""}">${bg._slAbility}</span>
			<div class="ve-col-4 px-1">${bg._skillDisplay}</div>
			<div class="ve-col-1 pl-1 pr-0 ve-flex-h-center ${Parser.sourceJsonToSourceClassname(bg.source)}" title="${Parser.sourceJsonToFull(bg.source)}" ${Parser.sourceJsonToStyle(bg.source)}>${source}${Parser.sourceJsonToMarkerHtml(bg.source)}</div>
		</div>`;

		const btnShowHidePreview = eleRow.firstElementChild.children[1].firstElementChild;

		const listItem = new ListItem(
			bgI,
			eleRow,
			bg.name,
			{
				hash,
				source,
				sourceJson: bg.source,
				ability: bg._slAbility,
				skills: bg._skillDisplay,
				ENG_name: bg.ENG_name,
			},
			{
				cbSel: eleRow.firstElementChild.firstElementChild.firstElementChild,
				btnShowHidePreview,
			},
		);

		ListUiUtil.bindPreviewButton(UrlUtil.PG_BACKGROUNDS, this._allData, listItem, btnShowHidePreview);

		return listItem;
	}
}

globalThis.ModalFilterBackgrounds = ModalFilterBackgrounds;
