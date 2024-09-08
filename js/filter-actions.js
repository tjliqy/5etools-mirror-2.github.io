"use strict";

class PageFilterActions extends PageFilterBase {
	static getTimeText (time) {
		return typeof time === "string" ? time : Parser.getTimeToFull(time);
	}

	constructor () {
		super();

		this._timeFilter = new Filter({
			header: "Type",
			displayFn: StrUtil.uppercaseFirst,
			itemSortFn: SortUtil.ascSortLower,
		});
		this._miscFilter = new Filter({header: "杂项", items: ["Optional/Variant Action", "SRD", "基础规则", "传奇"], isMiscFilter: true});
	}

	static mutateForFilters (it) {
		it._fTime = it.time ? it.time.map(it => it.unit || it) : null;
		it._fMisc = [];
		if (it.srd) it._fMisc.push("SRD");
		if (it.basicRules) it._fMisc.push("基础规则");
		if (SourceUtil.isLegacySourceWotc(it.source)) it._fMisc.push("传奇");
		if (it.fromVariant) it._fMisc.push("Optional/Variant Action");
	}

	addToFilters (it, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(it.source);
		this._timeFilter.addItem(it._fTime);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._timeFilter,
			this._miscFilter,
		];
	}

	toDisplay (values, it) {
		return this._filterBox.toDisplay(
			values,
			it.source,
			it._fTime,
			it._fMisc,
		);
	}
}

globalThis.PageFilterActions = PageFilterActions;
