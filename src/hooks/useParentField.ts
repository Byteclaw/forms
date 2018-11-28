import { useContext } from 'react';
import { FormFieldContext } from './formContext';
import { Field as ArrayField } from './useArrayField';
import { Field as ObjectField } from './useObjectField';

export default function useParentField(): ArrayField | ObjectField {
  return useContext(FormFieldContext);
}
