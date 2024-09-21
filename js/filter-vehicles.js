"use strict";

class PageFilterVehicles extends PageFilterBase {
	constructor () {
		super();

		this._vehicleTypeFilter = new Filter({
			header: "Vehicle Type",
			items: [],
			displayFn: Parser.vehicleTypeToFull,
			isSortByDisplayItems: true,
		});
		this._upgradeTypeFilter = new Filter({
			header: "Upgrade Type",
			items: [],
			displayFn: Parser.vehicleTypeToFull,
			isSortByDisplayItems: true,
		});
		this._terrainFilter = new Filter({header: "Terrain", items: ["land", "sea", "air"], displayFn: StrUtil.uppercaseFirst});
		this._speedFilter = new RangeFilter({header: "Speed"});
		this._acFilter = new RangeFilter({header: "Armor Class"});
		this._hpFilter = new RangeFilter({header: "Hit Points"});
		this._hpFilter = new RangeFilter({header: "Hit Points"});
		this._creatureCapacityFilter = new RangeFilter({header: "Creature Capacity"});
		this._miscFilter = new Filter({
			header: "Miscellaneous",
			cnHeader: "杂项",
			items: ["SRD", "传奇", "有图片", "有简介", "Has Token"],
			isMiscFilter: true,
			deselFn: PageFilterBase.defaultMiscellaneousDeselFn.bind(PageFilterBase),
		});
	}

	static mutateForFilters (ent) {
		ent._fSpeed = 0;
		if (typeof ent.speed === "number" && ent.speed > 0) {
			ent._fSpeed = ent.speed;
		} else if (ent.speed) {
			const maxSpeed = Math.max(...Object.values(ent.speed));
			if (maxSpeed > 0) ent._fSpeed = maxSpeed;
		} else if (ent.pace && typeof ent.pace === "number") {
			ent._fSpeed = ent.pace * 10; // Based on "Special Travel Pace," DMG p242
		}

		ent._fHp = 0;
		if (ent.hp && ent.hp.hp != null) {
			ent._fHp = ent.hp.hp;
		} else if (ent.hull && ent.hull.hp != null) {
			ent._fHp = ent.hull.hp;
		} else if (ent.hp && ent.hp.average != null) {
			ent._fHp = ent.hp.average;
		}

		ent._fAc = 0;
		if (ent.hull && ent.hull.ac != null) {
			ent._fAc = ent.hull.ac;
		} else if (ent.vehicleType === "INFWAR") {
			ent._fAc = 19 + Parser.getAbilityModNumber(ent.dex == null ? 10 : ent.dex);
		} else if (ent.ac instanceof Array) {
			ent._fAc = ent.ac.map(it => it.special ? null : (it.ac || it)).filter(it => it !== null);
		} else if (ent.ac) {
			ent._fAc = ent.ac;
		}

		ent._fCreatureCapacity = (ent.capCrew || 0) + (ent.capPassenger || 0) + (ent.capCreature || 0);

		this._mutateForFilters_commonMisc(ent);
		if (Renderer.vehicle.hasToken(ent)) ent._fMisc.push("Has Token");
	}

	addToFilters (it, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(it.source);
		this._vehicleTypeFilter.addItem(it.vehicleType);
		this._upgradeTypeFilter.addItem(it.upgradeType);
		this._speedFilter.addItem(it._fSpeed);
		this._terrainFilter.addItem(it.terrain);
		this._acFilter.addItem(it._fAc);
		this._hpFilter.addItem(it._fHp);
		this._creatureCapacityFilter.addItem(it._fCreatureCapacity);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._vehicleTypeFilter,
			this._upgradeTypeFilter,
			this._terrainFilter,
			this._speedFilter,
			this._acFilter,
			this._hpFilter,
			this._creatureCapacityFilter,
			this._miscFilter,
		];
	}

	toDisplay (values, it) {
		return this._filterBox.toDisplay(
			values,
			it.source,
			it.vehicleType,
			it.upgradeType,
			it.terrain,
			it._fSpeed,
			it._fAc,
			it._fHp,
			it._fCreatureCapacity,
			it._fMisc,
		);
	}
}

globalThis.PageFilterVehicles = PageFilterVehicles;

class ListSyntaxVehicles extends ListUiUtil.ListSyntax {
	static _INDEXABLE_PROPS_ENTRIES = [
		"control",
		"movement",
		"weapon",
		"other",
		"entries",

		"actionStation",

		"action",
		"trait",
		"reaction",
	];
}

globalThis.ListSyntaxVehicles = ListSyntaxVehicles;
