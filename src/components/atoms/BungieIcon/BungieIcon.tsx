import {DestinyDisplayPropertiesDefinition} from "bungie-api-ts/destiny2";
import {DestinyVendorDisplayPropertiesDefinition} from "bungie-api-ts/destiny2/interfaces";
import {ExtractKeysOfValueType} from "../../../helpers";
import React from "react";
import classes from './BungieIcon.module.scss';
import classNames from "classnames";

type PropDefsSupport = DestinyDisplayPropertiesDefinition | DestinyVendorDisplayPropertiesDefinition

type BungieIconCommonProps = {
  size?: number | 'small' | 'large' | 'inherit'
  style?: React.CSSProperties
  className?: string
  children?: React.ReactNode
}

type BungieIconDisplayPropertiesProps<T extends PropDefsSupport = DestinyDisplayPropertiesDefinition> = {
  displayProperties: T
  variant?: ExtractKeysOfValueType<T, string>
} & BungieIconCommonProps;

type BungieIconURLProps = {
  url: string
  size?: number | 'small' | 'large' | 'inherit',
} & BungieIconCommonProps


export function BungieIcon<T extends PropDefsSupport = DestinyDisplayPropertiesDefinition>(props: BungieIconDisplayPropertiesProps<T> | BungieIconURLProps) {

  const {
    size = 24,
    style,
    className
  } = props;

  const realSize = (
    size === 'inherit' ? undefined :
      size === 'small' ? 24 :
        size === 'large' ? 48 :
          size
  );

  const icon = 'url' in props ?
    props.url :
    props.variant ?
      props.displayProperties[props.variant] :
      props.displayProperties.highResIcon ?? props.displayProperties.icon;

  return (
    <div
      style={{
        width: realSize,
        height: realSize,
        backgroundImage: `url(https://www.bungie.net/${icon})`,
        ...style
      }}
      className={classNames(className, classes.root)}
    >
      {props.children}
    </div>
  )
}
