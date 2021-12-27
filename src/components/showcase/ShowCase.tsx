import React, {useEffect, useRef} from 'react'
import {observer} from "mobx-react";
import {BungieData, BungieDataClass} from "../../helpers/data/BungieData";
import {Alert, AlertTitle, Button, Paper, Tooltip} from "@mui/material";
import classes from './ShowCase.module.scss';
import Collapsible from "react-collapsible";
import {destinyData} from "../../helpers/data/data-frames/BungieDataFrames";
import {DestinyDisplayPropertiesDefinition, DestinyItemSubType} from "bungie-api-ts/destiny2";
import {BungieIcon} from "../atoms/BungieIcon/BungieIcon";
import classNames from "classnames";
import {Loading} from "../atoms/Loading/Loading";

export const ShowCase = observer(function ShowCase() {

  const error = BungieData.error;
  const loading = BungieData.fetching;

  const breakdownRef = useRef<ReturnType<BungieDataClass['weaponBreakdownBy']>>(null);

  useEffect(() => {
    BungieData.populate()
      .catch(console.error);
  }, []);

  useEffect(() => {

    if (!BungieData.weaponInventory) breakdownRef.current = null;

    breakdownRef.current = BungieData.weaponBreakdownBy(
      BungieData.weaponInventoryMap,
      [
        {
          dim: "inventoryBucketHash",
          title: (dimValue, subset) => <CollapsibleTitle
            displayProperties={BungieData.destiny?.DestinyInventoryBucketDefinition[dimValue].displayProperties}
            items={subset}
          />
        }, {
        dim: "damageTypeHash",
        title: (dimValue, subset) => <CollapsibleTitle
          displayProperties={BungieData.destiny?.DestinyDamageTypeDefinition[dimValue].displayProperties}
          items={subset}
        />
      }, {
        dim: "itemSubType",
        title: (dimValue: DestinyItemSubType, subset) => <CollapsibleTitle
          displayProperties={destinyData.weaponSubTypes?.[dimValue]?.displayProperties}
          items={subset}
        />
      }, {
        dim: "intrinsicsHash",
        title: (dimValue, subset) => <CollapsibleTitle
          displayProperties={BungieData.destiny?.DestinyInventoryItemDefinition[dimValue].displayProperties}
          items={subset}
        />
      }]
    );

  }, [BungieData.weaponInventoryMap]);


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

      {BungieData.weaponInventoryMap && breakdownRef.current && (
        <div className={classes.list}>
          <Breakdown items={breakdownRef.current}/>
        </div>
      )}

    </Paper>
  )
});

export const Breakdown = observer(
  function Breakdown(
    {
      items
    }: {
      items: Exclude<ReturnType<BungieDataClass['weaponBreakdownBy']>, null>
    }
  ) {


    return (
      <>
        {
          items.map(item => {

            return <div key={item.key}>
              <Collapsible
                className={classes.collapsible}
                triggerClassName={classes.header}
                openedClassName={classes.collapsible}
                triggerOpenedClassName={classNames(classes.header, classes.opened)}
                contentOuterClassName={classes.content}
                contentInnerClassName={classes.inner}
                trigger={<>{item.title}</>}
              >

                {
                  item.children ?
                    <Breakdown items={item.children}/> :
                    <Entries items={item.subset.entries}/>
                }

              </Collapsible>
            </div>
          })
        }
      </>
    );

  }
);

export const Entries = observer(function Entires({items}: { items: Exclude<BungieDataClass['weaponInventory'], null> }) {

  return <div className={classes.entries}>
    {items.map(i => {
      return (
        <div className={classes.entry} key={i.inventoryItem.itemInstanceId}>
          <BungieIcon
            key={i.inventoryItem.itemInstanceId}
            displayProperties={i.item.displayProperties}
            className={classes.icon}
            size="inherit"
          />

          <div className={classes.title}>
            {i.item.displayProperties.name}
          </div>

          <div className={classes.perks}>
            {
              i.perks
                .filter(p => p.visible)
                .map(p => BungieData.destiny?.DestinySandboxPerkDefinition[p.perkHash])
                .filter(x => !!x)
                .map(p =>
                  <Tooltip title={p!.displayProperties.name} key={p!.hash}>
                    <div>
                      <BungieIcon displayProperties={p!.displayProperties}
                                  size="inherit"
                                  className={classes.icon}
                      />
                    </div>
                  </Tooltip>
                )
            }
          </div>

          <CopyDIMQueryButton itemsIds={[i.inventoryItem.itemInstanceId!]}/>
        </div>
      )
    })}
  </div>

});

export function CollapsibleTitle(
  {
    displayProperties,
    items,
  }: {
    displayProperties?: DestinyDisplayPropertiesDefinition
    items: Exclude<BungieDataClass['weaponInventoryMap'], null>
  }
) {
  return (
    <div className={classes.title}>
      <BungieIcon
        size="inherit"
        className={classes.icon}
        displayProperties={displayProperties || ({} as DestinyDisplayPropertiesDefinition)}
      />

      <div className={classes.name}>
        {displayProperties?.name ?? '...'.toString()}
      </div>
      <div className={classes.count}>
        {items.length} item{items.length !== 1 ? 's' : ''}
      </div>

      <CopyDIMQueryButton
        itemsIds={items.entries.map(x => x.inventoryItem.itemInstanceId!)}
      />

    </div>
  )
}

function CopyDIMQueryButton({itemsIds}: { itemsIds: string[] }) {
  return (
    <Button
      onClick={() => {
        const ids = itemsIds.map(x => `id:${x}`);

        navigator.clipboard.writeText(ids.join(' or ')).catch(console.error);
      }}
      variant="outlined"
    >
      Copy DIM Query to clipboard
    </Button>
  )
}