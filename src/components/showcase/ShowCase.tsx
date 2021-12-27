import React, {useEffect, useState} from 'react'
import {observer} from "mobx-react";
import {BungieData, BungieDataClass, WeaponBreakdownList} from "../../helpers/data/BungieData";
import {Alert, AlertTitle, Paper, Typography} from "@mui/material";
import classes from './ShowCase.module.scss';
import {destinyData} from "../../helpers/data/data-frames/BungieDataFrames";
import {DestinyItemSubType} from "bungie-api-ts/destiny2";
import {Loading} from "../atoms/Loading/Loading";
import {Breakdown, CollapsibleTitle} from "./breakdown";
import 'react-reorderable-list/dist/index.css'

const {
  ReOrderableItem,
  ReOrderableList,
  ReOrderableListGroup
} = require('react-reorderable-list')

const breakdownNames: ({ [s in WeaponBreakdownList['dim']]: string }) = {
  intrinsicsHash: 'Intrinsic Archetype',
  itemSubType: 'Weapon Type',
  damageTypeHash: 'Damage Type',
  inventoryBucketHash: 'Inventory Slot'
};

const breakdowns: ({ [s in WeaponBreakdownList['dim']]: WeaponBreakdownList }) = {
  inventoryBucketHash: {
    dim: "inventoryBucketHash",
    title: (dimValue, subset) => <CollapsibleTitle
      displayProperties={BungieData.destiny?.DestinyInventoryBucketDefinition[dimValue].displayProperties}
      items={subset}
    />
  },
  damageTypeHash: {
    dim: "damageTypeHash",
    title: (dimValue, subset) => <CollapsibleTitle
      displayProperties={BungieData.destiny?.DestinyDamageTypeDefinition[dimValue].displayProperties}
      items={subset}
    />
  },
  itemSubType: {
    dim: "itemSubType",
    title: (dimValue: DestinyItemSubType, subset) => <CollapsibleTitle
      displayProperties={destinyData.weaponSubTypes?.[dimValue]?.displayProperties}
      items={subset}
    />
  },
  intrinsicsHash: {
    dim: "intrinsicsHash",
    title: (dimValue, subset) => <CollapsibleTitle
      displayProperties={BungieData.destiny?.DestinyInventoryItemDefinition[dimValue].displayProperties}
      items={subset}
    />
  }
} as const;


export const ShowCase = observer(function ShowCase() {

  const error = BungieData.error;
  const loading = BungieData.fetching;

  const [breakdown, setBreakdown] = useState<ReturnType<BungieDataClass['weaponBreakdownBy']>>(null);

  const [breakdownList, setBreakdownList] = useState<WeaponBreakdownList['dim'][][]>([
    [
      // used
      'inventoryBucketHash',
      'damageTypeHash',
      'itemSubType',
      'intrinsicsHash'
    ],
    [
      // unused
    ]
  ]);

  useEffect(() => {
    BungieData.populate()
      .catch(console.error);
  }, []);

  useEffect(() => {

    if (!BungieData.weaponInventoryMap) setBreakdown(null);

    setBreakdown(BungieData.weaponBreakdownBy(
      BungieData.weaponInventoryMap,
      breakdownList[0].map(i => breakdowns[i]),
    ));

  }, [BungieData.weaponInventoryMap, breakdownList]);


  return (
    <Paper className={classes.root}>
      {/* fixme standardise error messages */}
      {error && (
        <Alert severity="error" className={classes.error}>
          <AlertTitle>Opps, something bad happened!</AlertTitle>
          {error.message}
        </Alert>
      )}

      {loading && (
        <div className={classes.loading}>
          <Loading/>
        </div>
      )}

      {!loading && (
        <div className={classes.container}>
          <Paper className={classes.settings} elevation={2}>

            <Typography variant="h4">D2 Weapons breakdown</Typography>
<hr/>

            <Typography variant="h5">Breakdown criteria</Typography>
            <Typography variant="body1">You can drag criteria to re-order them and also to exclude them from the list</Typography>

            <div className={classes.spacer}/>
            <ReOrderableListGroup
              name='uniqueGroupName'
              group={breakdownList}
              onListGroupUpdate={(newList: WeaponBreakdownList['dim'][][]) => {
                if(newList[0].length === 0) return;
                setBreakdownList(newList);
              }}
            >

              <Typography variant="h5">Included</Typography>

              <ReOrderableList className={classes.breakdownList} style={{width: '100%', border: '1px solid white'}}>
                {breakdownList[0].map((i, idx) => (
                  <ReOrderableItem key={i}>
                    <Typography className={classes.breakdownListItem} variant="h6">
                      {idx+1}. {breakdownNames[i]}
                    </Typography>
                  </ReOrderableItem>
                ))}
              </ReOrderableList>

              <Typography variant="h5">Excluded</Typography>

              <ReOrderableList className={classes.breakdownList}>
                {breakdownList[1].map(i => (
                  <ReOrderableItem key={i}>
                    <Typography className={classes.breakdownListItem} variant="h6">
                      {breakdownNames[i]}
                    </Typography>
                  </ReOrderableItem>
                ))}
              </ReOrderableList>
            </ReOrderableListGroup>

          </Paper>
          {BungieData.weaponInventoryMap && breakdown && (
            <div className={classes.list}>
              <Breakdown items={breakdown}/>
            </div>
          )}
        </div>
      )}

    </Paper>
  )
});
