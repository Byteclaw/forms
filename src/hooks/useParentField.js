// @flow

// $FlowFixMe
import { useContext } from 'react';
import { FormFieldContext } from './formContext';
import type { Field as ArrayField } from './useArrayField';
import type { Field as ObjectField } from './useObjectField';

export default function useParentField(): ArrayField | ObjectField {
  return useContext(FormFieldContext);
}
