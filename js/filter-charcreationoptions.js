"use strict";

class PageFilterCharCreationOptions extends PageFilterBase {
	static _filterFeatureTypeSort (a, b) {
		return SortUtil.ascSort(Parser.charCreationOptionTypeToFull(a.item), Parser.charCreationOptionTypeToFull(b.item));
	}

	constructor () {
		super();
		this._typeFilter = new Filter({
			header: "Feature Type",
			items: [],
			displayFn: Parser.charCreationOptionTypeToFull,
			itemSortFn: PageFilterCharCreationOptions._filterFeatureTypeSort,
		});
		this._miscFilter = new Filter({header: "Miscellaneous",cnHeader:"杂项", items: ["SRD", "传奇", "有图片", "有简介"], isMiscFilter: true});
	}

	static mutateForFilters (it) {
		it._fOptionType = Parser.charCreationOptionTypeToFull(it.optionType);
		it._fMisc = it.srd ? ["SRD"] : [];
		if (SourceUtil.isLegacySourceWotc(it.source)) it._fMisc.push("传奇");
		if (this._hasFluff(it)) it._fMisc.push("有简介");
		if (this._hasFluffImages(it)) it._fMisc.push("有图片");
	}

	addToFilters (it, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(it.source);
		this._typeFilter.addItem(it._fOptionType);
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
			it._fOptionType,
			it._fMisc,
		);
	}
}

globalThis.PageFilterCharCreationOptions = PageFilterCharCreationOptions;
