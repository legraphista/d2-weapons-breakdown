import React from 'react'
import {DestinyDisplayPropertiesDefinition} from "bungie-api-ts/destiny2";

const MAX_VAL = 45;
export function StatLine({
  value,
  isMax,
  displayProperties
}: { value: number, isMax: boolean, displayProperties: DestinyDisplayPropertiesDefinition }) {
  return (
    <div
      style={{
        width: '100%',
        height: 12,
        background: 'rgb(73,73,73)',
        border: isMax ? '1 px solid gold ' : undefined,
      }}>
      <div
        style={{
          height: '100%',
          maxWidth: '100%',
          width: (value / MAX_VAL * 100) + '%',
          background: isMax ? 'gold' : 'rgb(222,222,222)',
        }}>
      </div>
    </div>
  )
}
