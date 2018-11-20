// @flow

import type { Node } from 'react';
import useConnectedForm, { type Form } from '../hooks/useConnectedForm';

type Props = {
  children: (form: Form) => Node,
};

export default function FormProvider({ children }: Props) {
  const form = useConnectedForm();

  return children(form);
}
