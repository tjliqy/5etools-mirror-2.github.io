"use strict";

class PageFilterLanguages extends PageFilterBase {
	constructor () {
		super();

		this._typeFilter = new Filter({header: "Type", items: ["standard", "exotic", "rare", "secret"], itemSortFn: null, displayFn: StrUtil.uppercaseFirst});
		this._scriptFilter = new Filter({header: "Script", displayFn: StrUtil.uppercaseFirst});
		this._miscFilter = new Filter({header: "Miscellaneous", items: ["Has Fonts", "SRD", "基础规则", "传奇", "有图片", "有简介"], isMiscFilter: true});
	}

	static mutateForFilters (it) {
		it._fMisc = [];
		if (it.fonts || it._fonts) it._fMisc.push("Has Fonts");
		if (it.srd) it._fMisc.push("SRD");
		if (it.basicRules) it._fMisc.push("基础规则");
		if (SourceUtil.isLegacySourceWotc(it.source)) it._fMisc.push("传奇");
		if (this._hasFluff(it)) it._fMisc.push("有简介");
		if (this._hasFluffImages(it)) it._fMisc.push("有图片");
	}

	addToFilters (it, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(it.source);
		this._scriptFilter.addItem(it.script);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._typeFilter,
			this._scriptFilter,
			this._miscFilter,
		];
	}

	toDisplay (values, it) {
		return this._filterBox.toDisplay(
			values,
			it.source,
			it.type,
			it.script,
			it._fMisc,
		);
	}
}

globalThis.PageFilterLanguages = PageFilterLanguages;
