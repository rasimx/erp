import React, { FC } from 'react';

import { useFormState } from './types';

export type Props = {};

const Step_1: FC<Props> = props => {
  const { newBathes } = useFormState();

  console.log(newBathes);

  return <div>aaaa</div>;
};

export default Step_1;
