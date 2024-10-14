export const getEnv = (envVar: string): string => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not defined`);
  }
  return process.env[envVar] as string;
};

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export const getRandomNumbersArray = (
  min: number,
  max: number,
  arrayLength: number,
  sum: number,
): number[] =>
  Array.from({ length: arrayLength }, (_, i) => {
    const smin = (arrayLength - i - 1) * min,
      smax = (arrayLength - i - 1) * max,
      offset = Math.max(sum - smax, min),
      random = 1 + Math.min(sum - offset, max - offset, sum - smin - min),
      value = Math.floor(Math.random() * random + offset);

    sum -= value;
    return value;
  });

export const sumOfArray = (arr: number[]): number =>
  arr.reduce(function (acc, val) {
    return acc + val;
  }, 0);

export function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null),
      );
    });
  });
}

export const isDev = ['dev', 'development'].includes(getEnv('APP_ENV'));
export const isProd = ['prod', 'production'].includes(getEnv('APP_ENV'));

export type JSONCompatible<T> = T extends string | number | boolean | null
  ? T
  : T extends (infer U)[]
    ? JSONCompatible<U>[]
    : T extends object
      ? { [K in keyof T]: JSONCompatible<T[K]> }
      : never;

export const isNil = <T>(value: T): value is Extract<T, null | undefined> => {
  return value === null || value === undefined;
};

export const deepFreeze = <T>(source: T, freezeParent = true): DRo<T> => {
  if (freezeParent) Object.freeze(source);

  Object.getOwnPropertyNames(source).forEach(function (prop) {
    if (
      Object.prototype.hasOwnProperty.call(source as never, prop) &&
      (source as never)[prop] !== null &&
      (typeof (source as never)[prop] === 'object' ||
        typeof (source as never)[prop] === 'function')
    ) {
      if (Object.isFrozen((source as never)[prop])) {
        deepFreeze((source as never)[prop], false);
      } else {
        deepFreeze((source as never)[prop], true);
      }
    }
  });

  return source as DRo<T>;
};

type DRo<T> = T extends (infer R)[]
  ? DRoArr<R>
  : // eslint-disable-next-line @typescript-eslint/ban-types
    T extends Function
    ? T
    : T extends object
      ? DRoObj<T>
      : T;

type DRoArr<T> = readonly DRo<T>[];

type DRoObj<T> = {
  readonly [P in keyof T]: DRo<T[P]>;
};
