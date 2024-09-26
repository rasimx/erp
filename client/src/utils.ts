import { Nullable } from 'primereact/ts-helpers';

export const toRouble = (value: number) => Number((value / 100).toFixed(2));
export const fromRouble = (value: number) => Number((value * 100).toFixed(0));

// export type RecursiveNullable<T> = {
//   [P in keyof T]?: T[P] extends (infer U)[]
//     ? RecursiveNullable<U>[] | null | undefined
//     : T[P] extends object
//       ? RecursiveNullable<T[P]>
//       : T[P] | null | undefined;
// };

export type DeepNullable<T, NonDeepNull extends keyof T = never> = {
  [P in keyof T]?: P extends NonDeepNull
    ? T[P] | null | undefined
    : T[P] extends (infer U)[]
      ? DeepNullable<U>[] | null | undefined // Для массивов элементы могут быть null
      : T[P] extends object
        ? DeepNullable<T[P], never> // Для объектов рекурсивная обработка
        : T[P] | null; // Остальные типы могут быть null
};

// export type RecursiveNullable<T, K extends string> = {
//   [P in keyof T]: K extends `${P & string}.${infer Rest}`
//     ? T[P] extends object
//       ? RecursiveNullable<T[P], Rest> // Продолжаем рекурсию для вложенных объектов
//       : T[P] | null // Если объект примитив, оставляем как есть
//     : K extends P & string
//       ? T[P] | null // Если это указанное поле на данном уровне, не делаем его nullable
//       : T[P] extends (infer U)[]
//         ? RecursiveNullable<U, K>[] | null // Для массивов элементы могут быть null
//         : T[P] extends object
//           ? RecursiveNullable<T[P], K> // Рекурсия для вложенных объектов
//           : T[P] | null; // Все остальные поля могут быть null
// };

// export type RecursiveNonNullable<T> = {
//   [P in keyof T]: T[P] extends object ? RecursiveNullable<T[P]> : T[P];
// };

export const isNil = <T>(value: T): value is Extract<T, null | undefined> => {
  return value === null || value === undefined;
};

export const isDefined = <T>(
  value: T,
): value is Exclude<T, null | undefined> => {
  return value !== null && value !== undefined;
};

export const isInteger = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value);
};

export const isNumber = (value: unknown): value is number => {
  return (
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    value !== Infinity &&
    value !== -Infinity
  );
};
