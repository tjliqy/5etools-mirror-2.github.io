"use strict";

class PageFilterObjects extends PageFilterBase {
	constructor () {
		super();

		this._miscFilter = new Filter({header: "Miscellaneous", items: ["SRD", "传奇", "有图片", "有简介", "Has Token"], isMiscFilter: true});
	}

	static mutateForFilters (obj) {
		obj._fMisc = obj.srd ? ["SRD"] : [];
		if (SourceUtil.isLegacySourceWotc(obj.source)) obj._fMisc.push("传奇");
		if (Renderer.object.hasToken(obj)) obj._fMisc.push("Has Token");
		if (this._hasFluff(obj)) obj._fMisc.push("有简介");
		if (this._hasFluffImages(obj)) obj._fMisc.push("有图片");
	}

	addToFilters (obj, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(obj.source);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._miscFilter,
		];
	}

	toDisplay (values, obj) {
		return this._filterBox.toDisplay(
			values,
			obj.source,
			obj._fMisc,
		);
	}
}

globalThis.PageFilterObjects = PageFilterObjects;

class ListSyntaxObjects extends ListUiUtil.ListSyntax {
	static _INDEXABLE_PROPS_ENTRIES = [
		"entries",
		"actionEntries",
	];
}

globalThis.ListSyntaxObjects = ListSyntaxObjects;
