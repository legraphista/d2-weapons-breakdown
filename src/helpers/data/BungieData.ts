import {computed, flow, makeObservable, observable} from "mobx";
import {CharactersDataFrame, destinyData, destinyManifest, MembershipDataFrame} from "./data-frames/BungieDataFrames";
import {assertExists, assertTrue, bucketBy} from "../index";
import {BungieRequests} from "../comms";
import {DestinyInventoryBucketDefinition, DestinyItemType} from "bungie-api-ts/destiny2";
import {MultidimensionalMap} from "multidimensional-map";

export const InventoryBucketHashes = {
  kinetic: 1498876634,
  energy: 2465295065,
  power: 953998645
}

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

  @computed get weaponInventory() {
    if (!this.characters?.data || !this.destiny) return null;

    const {DestinyInventoryItemDefinition, DestinyInventoryBucketDefinition} = this.destiny;
    const {profileInventory: {data: profileInventoryData}, itemComponents} = this.characters.data;

    const inventoryItems = profileInventoryData?.items;
    assertExists(inventoryItems, 'Cannot get inventory items');

    const weapons = inventoryItems
      .filter(x => DestinyInventoryItemDefinition[x.itemHash]?.itemType === DestinyItemType.Weapon)
      .map(inventoryItem => ({
        inventoryItem,
        item: DestinyInventoryItemDefinition[inventoryItem.itemHash],
        instance: itemComponents.instances.data![inventoryItem.itemInstanceId!],
        perks: itemComponents.perks.data![inventoryItem.itemInstanceId!],
        stats: itemComponents.stats.data![inventoryItem.itemInstanceId!],
        talentGrids: itemComponents.talentGrids.data![inventoryItem.itemInstanceId!],
        reusablePlugs: itemComponents.reusablePlugs.data![inventoryItem.itemInstanceId!],
      }))
      .map(x => ({
        ...x,
        intrinsics: DestinyInventoryItemDefinition[x.item.sockets!.socketEntries.find(x => x.socketTypeHash === 3956125808)!.singleInitialItemHash],
        damageTypes: x.item.defaultDamageType,
        itemSubType: x.item.itemSubType,
        inventoryBucket: DestinyInventoryBucketDefinition[x.item.inventory!.bucketTypeHash],
      }))
      .map(x => ({
        ...x,
        intrinsicsHash: x.intrinsics.hash,
        inventoryBucketHash: x.inventoryBucket.hash
      }))


    const ndmap = new MultidimensionalMap(['inventoryBucketHash', 'damageTypes', 'itemSubType', 'intrinsicsHash'],weapons);


    console.log(ndmap.getSubset({
      'inventoryBucketHash': {
        matches: [InventoryBucketHashes.kinetic]
      }
    }))

    // return weapons;
return ndmap;


  }

}

export const BungieData = new BungieDataClass();

//@ts-ignore
window.BungieData = BungieData;
