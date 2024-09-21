"use strict";

class PageFilterLanguages extends PageFilterBase {
	constructor () {
		super();

		this._typeFilter = new Filter({header: "Type", items: ["standard", "exotic", "rare", "secret"], itemSortFn: null, displayFn: StrUtil.uppercaseFirst});
		this._scriptFilter = new Filter({header: "Script", displayFn: StrUtil.uppercaseFirst});
		this._miscFilter = new Filter({
			header: "Miscellaneous",
			cnHeader: "杂项",
			items: ["Has Fonts", "SRD", "基础规则", "传奇", "有图片", "有简介"],
			isMiscFilter: true,
			deselFn: PageFilterBase.defaultMiscellaneousDeselFn.bind(PageFilterBase),
		});
	}

	static mutateForFilters (it) {
		this._mutateForFilters_commonMisc(it);
		if (it.fonts || it._fonts) it._fMisc.push("Has Fonts");
	}

	addToFilters (it, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(it.source);
		this._scriptFilter.addItem(it.script);
		this._miscFilter.addItem(it._fMisc);
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
