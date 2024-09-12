export const toRouble = (value: number) => Number((value / 100).toFixed(2));
export const fromRouble = (value: number) => Number((value * 100).toFixed(0));

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? RecursivePartial<T[P]> | undefined
    : T[P] | undefined;
};
export type RecursiveNonNullable<T> = {
  [P in keyof T]: T[P] extends object ? RecursivePartial<T[P]> : T[P];
};
