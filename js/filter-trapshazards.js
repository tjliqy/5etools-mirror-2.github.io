"use strict";

class PageFilterTrapsHazards extends PageFilterBase {
	// region static
	static sortFilterType (a, b) {
		return SortUtil.ascSortLower(Parser.trapHazTypeToFull(a.item), Parser.trapHazTypeToFull(b.item));
	}
	// endregion

	constructor () {
		super();

		this._typeFilter = new Filter({
			header: "Type",
			items: [
				"MECH",
				"MAG",
				"SMPL",
				"CMPX",
				"HAZ",
				"WTH",
				"ENV",
				"WLD",
				"GEN",
			],
			displayFn: Parser.trapHazTypeToFull,
			itemSortFn: PageFilterTrapsHazards.sortFilterType.bind(PageFilterTrapsHazards),
		});
		this._miscFilter = new Filter({header: "Miscellaneous", items: ["SRD", "基础规则", "传奇", "有图片", "有简介"], isMiscFilter: true});
	}

	static mutateForFilters (it) {
		it.trapHazType = it.trapHazType || "HAZ";

		it._fMisc = [];
		if (it.srd) it._fMisc.push("SRD");
		if (it.basicRules) it._fMisc.push("基础规则");
		if (SourceUtil.isLegacySourceWotc(it.source)) it._fMisc.push("传奇");
		if (this._hasFluff(it)) it._fMisc.push("有简介");
		if (this._hasFluffImages(it)) it._fMisc.push("有图片");
	}

	addToFilters (it, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(it.source);
		this._typeFilter.addItem(it.trapHazType);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._typeFilter,
			this._miscFilter,
		];
	}

	toDisplay (values, it) {
		return this._filterBox.toDisplay(
			values,
			it.source,
			it.trapHazType,
			it._fMisc,
		);
	}
}

globalThis.PageFilterTrapsHazards = PageFilterTrapsHazards;

class ListSyntaxTrapsHazards extends ListUiUtil.ListSyntax {
	static _INDEXABLE_PROPS_ENTRIES = [
		"effect",
		"trigger",
		"countermeasures",
		"entries",
	];
}

globalThis.ListSyntaxTrapsHazards = ListSyntaxTrapsHazards;
