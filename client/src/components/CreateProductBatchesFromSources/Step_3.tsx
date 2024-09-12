import React, { FC } from 'react';

import { useFormState } from './types';

export type Props = {};

const Step_1: FC<Props> = props => {
  const {} = props;
  const { state } = useFormState();

  return <div>AAAAA</div>;
};

export default Step_1;
