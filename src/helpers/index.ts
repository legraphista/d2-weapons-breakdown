export function assertExists<T>(
  value: Exclude<T, boolean>,
  message: string | Error
): asserts value {
  const check = value !== undefined && value !== null;

  if (!check) {
    if (message instanceof Error) {
      message.message = 'AssertExists fail: ' + message.message;
      Error.captureStackTrace(message);
      throw message;
    }
    throw new Error('AssertExists fail: ' + message?.toString());
  }

}

export function assertTrue(value: boolean, message: string | Error): asserts value is true {
  const check = value === true;

  if (!check) {
    if (message instanceof Error) {
      message.message = 'AssertTrue failed: ' + message.message;
      Error.captureStackTrace(message);
      throw message;
    }
    throw new Error('AssertTrue failed: ' + message?.toString());
  }
}


export function objectValues<T extends { [s: string]: any }>(obj: T): T[keyof T][] {
  return Object.keys(obj).map(k => obj[k]);
}

export function objectKV<T extends { [s: string]: any }>(obj: T): [keyof T, T[keyof T]][] {
  return Object.keys(obj).map(k => [k, obj[k]]);
}

// @ts-ignore
window.objectKV = objectKV;

// based on https://stackoverflow.com/questions/49796842/keyof-that-is-also-of-type-t
export type ExtractKeysOfValueType<T, K> = { [I in keyof T]: T[I] extends K ? I : never }[keyof T];

export function bucketBy<T extends object, K extends keyof T, C extends T[K]>(list: T[], fn: (item: T) => C): Map<C, T[]> {

  const map = new Map<C, T[]>();

  for(let i = 0; i < list.length;i++){
    const item = list[i];
    const crit = fn(item);

    if(!map.has(crit)) map.set(crit, []);

    map.get(crit)!.push(item);
  }

  return map;
}
