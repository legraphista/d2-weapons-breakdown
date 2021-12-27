import {DataFrame, DataFrameOptions} from "./index";
import {
  BungieMembershipType,
  DestinyComponentType, DestinyItemCategoryDefinition, DestinyItemSubType,
  DestinyItemType,
  DestinyManifest,
  DestinyPublicVendorsResponse,
  DestinyVendorsResponse,
  getDestinyManifestSlice,
  getProfile,
  getPublicVendors,
  getVendors
} from "bungie-api-ts/destiny2";
import {BungieRequests} from "../../comms";
import {AllDestinyManifestComponents} from "bungie-api-ts/destiny2/manifest";
import {getMembershipDataForCurrentUser, UserMembershipData} from "bungie-api-ts/user";
import {ServerResponse} from "bungie-api-ts/common";
import {computed} from "mobx";
import {DestinyProfileResponse} from "bungie-api-ts/destiny2/interfaces";
import {assertTrue, objectValues} from "../../index";

export class DestinyManifestFrame extends DataFrame<DestinyManifest> {

  protected async fetch() {
    const manifest: DestinyManifest = await BungieRequests.noApiKeyReq<DestinyManifest>({
      url: 'https://www.bungie.net/Platform/Destiny2/Manifest/',
      method: 'GET',
    }).then(serverResponseToData);

    assertTrue(!!manifest?.version, 'could not download Destiny 2 manifest');

    return manifest;
  }
}

export const destinyManifest = new DestinyManifestFrame({ autoFetch: true });

export class DestinyDataFrame extends DataFrame<Pick<AllDestinyManifestComponents,
  'DestinyInventoryBucketDefinition' |
  'DestinyInventoryItemDefinition' |
  'DestinyItemCategoryDefinition' |
  'DestinySandboxPerkDefinition' |
  'DestinyDamageTypeDefinition'|
  'DestinyVendorDefinition' |
  'DestinyGenderDefinition' |
  'DestinyClassDefinition' |
  'DestinyRaceDefinition' |
  'DestinyStatDefinition'>> {
  protected async fetch() {
    const manifest = await destinyManifest.get();
    return await getDestinyManifestSlice(BungieRequests.noApiKeyReqWithCacheBusting, {
      destinyManifest: manifest,
      language: "en",
      tableNames: [
        'DestinyInventoryBucketDefinition',
        'DestinyInventoryItemDefinition',
        'DestinyItemCategoryDefinition',
        'DestinySandboxPerkDefinition',
        'DestinyDamageTypeDefinition',
        'DestinyVendorDefinition',
        'DestinyGenderDefinition',
        'DestinyClassDefinition',
        'DestinyRaceDefinition',
        'DestinyStatDefinition'
      ]
    });
  }

  @computed get weaponSubTypes() {
    if(!this.data) return null;

    const weapons = objectValues(this.data.DestinyItemCategoryDefinition).filter(x => x.grantDestinyItemType===DestinyItemType.None)

    return weapons.reduce((a, c) => {
      a[c.grantDestinySubType] = c;
      return a;
    }, {} as {[s in DestinyItemSubType]: DestinyItemCategoryDefinition })
  }

}

export const destinyData = new DestinyDataFrame({ autoFetch: true });
// @ts-ignore
window.destinyData = destinyData;

function serverResponseToData<T>(resp: ServerResponse<T>): T {
  return resp.Response;
}

export class MembershipDataFrame extends DataFrame<UserMembershipData> {

  @computed get primaryMembershipId() {
    return this.data?.primaryMembershipId || this.data?.destinyMemberships[0]?.membershipId;
  }

  @computed get primaryMembership() {
    return this.data?.destinyMemberships.find(x => x.membershipId === this.primaryMembershipId);
  }

  @computed get primaryMembershipType() {
    return this.primaryMembership?.membershipType;
  }

  protected async fetch() {
    const membership = await getMembershipDataForCurrentUser(BungieRequests.userReq).then(serverResponseToData);

    assertTrue(
      (
        membership.destinyMemberships.length > 0 &&
        (!!membership.primaryMembershipId || !!membership.destinyMemberships[0]?.membershipId)
      ),
      'We couldn\'t find any memberships on your account'
    );

    return membership;
  }
}

export class CharactersDataFrame extends DataFrame<DestinyProfileResponse> {

  readonly membershipType: BungieMembershipType;
  readonly membershipId: string

  constructor(membershipType: BungieMembershipType, membershipId: string, options?: DataFrameOptions) {
    super(options);
    this.membershipType = membershipType;
    this.membershipId = membershipId;
  }

  protected async fetch() {

    const { membershipType, membershipId } = this;

    return await getProfile(BungieRequests.userReq, {
      membershipType,
      destinyMembershipId: membershipId,
      components: [
        DestinyComponentType.Characters,
        DestinyComponentType.CurrencyLookups,
        DestinyComponentType.ProfileInventories,
        DestinyComponentType.CharacterInventories,
        DestinyComponentType.ItemInstances,
        DestinyComponentType.ItemPerks,
        DestinyComponentType.ItemStats,
        DestinyComponentType.ItemTalentGrids,
        DestinyComponentType.ItemCommonData,
        DestinyComponentType.ItemReusablePlugs,
      ]
    }).then(serverResponseToData);
  }
}
