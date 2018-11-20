// @flow

// $FlowFixMe
import { useContext } from 'react';
import { FormFieldContext } from './formContext';
import type { Form } from './useForm';

export type { Form };

export default function useConnectedForm(): Form {
  return useContext(FormFieldContext);
}
