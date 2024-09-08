"use strict";

class PageFilterConditionsDiseases extends PageFilterBase {
	// region static
	static getDisplayProp (prop) {
		return prop === "status" ? "其他" : Parser.getPropDisplayName(prop);
	}
	// endregion

	constructor () {
		super();

		this._typeFilter = new Filter({
			header: "Type",
			cnHeader: "类型",
			items: ["condition", "disease", "status"],
			displayFn: PageFilterConditionsDiseases.getDisplayProp,
			deselFn: (it) => it === "disease" || it === "status",
		});
		this._miscFilter = new Filter({header: "Miscellaneous",cnHeader:"杂项", items: ["SRD", "基础规则", "传奇", "有图片", "有简介"], isMiscFilter: true});
	}

	static mutateForFilters (it) {
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
			it.__prop,
			it._fMisc,
		);
	}
}

globalThis.PageFilterConditionsDiseases = PageFilterConditionsDiseases;
