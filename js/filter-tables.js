"use strict";

class PageFilterTables extends PageFilterBase {
	// region static
	static _sourceSelFn (val) {
		return !SourceUtil.isNonstandardSource(val) && !SourceUtil.isAdventure(val);
	}
	// endregion

	constructor () {
		super({sourceFilterOpts: {selFn: PageFilterTables._sourceSelFn}});

		this._miscFilter = new Filter({header: "Miscellaneous", items: ["SRD", "基础规则", "传奇"], isMiscFilter: true});
	}

	static mutateForFilters (it) {
		it._fMisc = it.srd ? ["SRD"] : [];
		if (it.basicRules) it._fMisc.push("基础规则");
		if (SourceUtil.isLegacySourceWotc(it.source)) it._fMisc.push("传奇");
	}

	addToFilters (it, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(it.source);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._miscFilter,
		];
	}

	toDisplay (values, it) {
		return this._filterBox.toDisplay(
			values,
			it.source,
			it._fMisc,
		);
	}
}

globalThis.PageFilterTables = PageFilterTables;

class ListSyntaxTables extends ListUiUtil.ListSyntax {
	static _INDEXABLE_PROPS_ENTRIES = [
		"rows",
		"tables",
	];
}

globalThis.ListSyntaxTables = ListSyntaxTables;
