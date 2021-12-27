import {observer} from "mobx-react";
import {BungieData, BungieDataClass} from "../../helpers/data/BungieData";
import Collapsible from "react-collapsible";
import classes from "./breakdown.module.scss";
import classNames from "classnames";
import {BungieIcon} from "../atoms/BungieIcon/BungieIcon";
import {Button, Tooltip} from "@mui/material";
import {DestinyDisplayPropertiesDefinition} from "bungie-api-ts/destiny2";
import React from "react";

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
                lazyRender
                transitionTime={100}
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        const ids = itemsIds.map(x => `id:${x}`);

        navigator.clipboard.writeText(ids.join(' or ')).catch(console.error);
      }}
      variant="outlined"
    >
      Copy DIM Query to clipboard
    </Button>
  )
}