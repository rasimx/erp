import { CreateStyled } from '@emotion/styled';

export const transientOptions: Parameters<CreateStyled>[1] = {
  shouldForwardProp: (propName: string) => !propName.startsWith('$'),
};

export const toRouble = (value: number) => (value / 100).toFixed(2);
export const fromRouble = (value: number) => value * 100;
