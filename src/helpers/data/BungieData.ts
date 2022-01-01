import {computed, flow, makeObservable, observable} from "mobx";
import {CharactersDataFrame, destinyData, destinyManifest, MembershipDataFrame} from "./data-frames/BungieDataFrames";
import {assertExists, assertTrue, objectValues} from "../index";
import {BungieRequests} from "../comms";
import {DestinyItemComponent, DestinyItemType, TierType} from "bungie-api-ts/destiny2";
import {MultidimensionalMap} from "multidimensional-map";
import type React from "react";

export class BungieDataClass {

  @computed get destiny() {
    return destinyData.data;
  }

  membership: MembershipDataFrame = new MembershipDataFrame();
  @observable.ref
  characters: CharactersDataFrame | null = null;

  @computed get fetching() {
    return this.membership.fetching || this.characters?.fetching || false;
  }

  @computed get error() {
    return destinyManifest.error || destinyData.error || this.membership.error || this.characters?.error || null;
  }

  constructor() {
    makeObservable(this);
  }

  populate = flow(function* populate(this: BungieDataClass) {
    assertTrue(BungieRequests.isLoggedIn, 'You have to login first');

    yield this.membership.populate();

    const {primaryMembershipId, primaryMembershipType} = this.membership;

    assertExists(primaryMembershipId && primaryMembershipType, 'membership not found');

    this.characters = new CharactersDataFrame(primaryMembershipType, primaryMembershipId);
    yield this.characters.populate();

    yield destinyData.populate();
  })

  @observable excludeExotics = false;
  @observable showOnlyDuplicates = true;

  @computed get weaponInventory() {
    if (!this.characters?.data || !this.destiny) return null;

    const {DestinyInventoryItemDefinition, DestinyInventoryBucketDefinition} = this.destiny;
    const {
      profileInventory: {data: profileInventoryData},
      itemComponents,
      characterInventories: {data: charactersInventory}
    } = this.characters.data;

    let inventoryItems: DestinyItemComponent[] = profileInventoryData?.items ?? [];
    objectValues(charactersInventory ?? {})
      .forEach(i => inventoryItems = inventoryItems.concat(i.items));

    assertExists(inventoryItems, 'Cannot get inventory items');

    let data = inventoryItems
      .filter(x => {
        const defs = DestinyInventoryItemDefinition[x.itemHash];

        if (this.excludeExotics && defs?.inventory?.tierType === TierType.Exotic) {
          return false;
        }

        return defs?.itemType === DestinyItemType.Weapon;
      })
      .map(inventoryItem => ({
        inventoryItem,
        item: DestinyInventoryItemDefinition[inventoryItem.itemHash],
        instance: itemComponents.instances.data![inventoryItem.itemInstanceId!],
        perks: itemComponents.perks.data![inventoryItem.itemInstanceId!].perks,
        stats: itemComponents.stats.data![inventoryItem.itemInstanceId!].stats,
        talentGrids: itemComponents.talentGrids.data![inventoryItem.itemInstanceId!],
      }))
      .map(x => ({
        ...x,
        intrinsics: DestinyInventoryItemDefinition[x.item.sockets!.socketEntries.find(x => x.socketTypeHash === 3956125808)!.singleInitialItemHash],
        damageTypeHash: x.item.defaultDamageTypeHash,
        itemSubType: x.item.itemSubType,
        inventoryBucket: DestinyInventoryBucketDefinition[x.item.inventory!.bucketTypeHash],
      }))
      .map(x => ({
        ...x,
        intrinsicsHash: x.intrinsics.hash,
        inventoryBucketHash: x.inventoryBucket.hash
      }))
      .sort((a, b) => {
        const nameSort = a.item.displayProperties.name.localeCompare(b.item.displayProperties.name);

        if (nameSort !== 0) return nameSort;

        return b.instance.primaryStat.value - a.instance.primaryStat.value;
      });

    if (this.showOnlyDuplicates) {
      const map = new Map<number, number>();

      data.forEach(i => {
        const hash = i.item.hash;

        if (map.has(hash)) {
          map.set(hash, map.get(hash)! + 1);
        } else {
          map.set(hash, 1);
        }
      });

      data = data.filter(x => {
        return (map.get(x.item.hash) || 0) > 1;
      });
    }


    return data;
  }

  @computed get weaponInventoryMap() {

    if (!this.weaponInventory) return null

    return new MultidimensionalMap(
      ['inventoryBucketHash', 'damageTypeHash', 'itemSubType', 'intrinsicsHash'],
      this.weaponInventory
    );
  }

  weaponBreakdownBy(
    map: BungieDataClass['weaponInventoryMap'],
    breakdownList: WeaponBreakdownList[],
    sortBy: 'count' | 'alpha' | 'key'
  ): WeaponBreakdownByReturnType[] | null {

    if (!map) return null;

    const first = breakdownList[0];

    const keys = [...map.dimensions[first.dim].map.keys()] as number[];

    const data = keys
      .map(key => {
        const subset = map.getSubset({
          [first.dim]: {
            matches: [key]
          }
        });

        return ({
          key,
          name: first.name(key),
          subset,
          title: first.title(key, subset),
          children: breakdownList.length > 1 ? this.weaponBreakdownBy(
            subset,
            breakdownList.slice(1),
            sortBy
          ) : null
        })

      });

    if (sortBy === 'count') {
      data.sort((a, b) => b.subset.length - a.subset.length);
    }
    if (sortBy === 'key') {
      data.sort((a, b) => a.key.toString().localeCompare(b.key.toString()));
    }
    if (sortBy === 'alpha') {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }

    return data;
  }

}


export type WeaponBreakdownByReturnType = {
  key: number,
  name: string,
  title: React.ReactNode,
  subset: Exclude<BungieDataClass['weaponInventoryMap'], null>,
  children: WeaponBreakdownByReturnType[] | null
}
export type WeaponBreakdownList = {
  dim: ('inventoryBucketHash' | 'damageTypeHash' | 'itemSubType' | 'intrinsicsHash'),
  name: (dimValue: any) => string,
  title: (dimValue: any, subset: Exclude<BungieDataClass['weaponInventoryMap'], null>) => React.ReactNode,
}

export const BungieData = new BungieDataClass();

//@ts-ignore
window.BungieData = BungieData;
