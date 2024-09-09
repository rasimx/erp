import { CreateStyled } from '@emotion/styled';

export const transientOptions: Parameters<CreateStyled>[1] = {
  shouldForwardProp: (propName: string) => !propName.startsWith('$'),
};

export const toRouble = (value: number) => Number((value / 100).toFixed(2));
export const fromRouble = (value: number) => Number((value * 100).toFixed(0));

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type RecursiveNullable<T> = {
  [P in keyof T]: T[P] extends object
    ? RecursiveNullable<T[P]> | null
    : T[P] | null;
};
export type RecursiveNonNullable<T> = {
  [P in keyof T]: T[P] extends object ? RecursiveNullable<T[P]> : T[P];
};
