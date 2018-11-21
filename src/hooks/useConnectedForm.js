// @flow

// $FlowFixMe
import { useContext } from 'react';
import { FormContext } from './formContext';
import type { Form } from './useForm';

export type { Form };

export default function useConnectedForm(): Form {
  return useContext(FormContext);
}
