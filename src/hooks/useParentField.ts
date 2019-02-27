import { useContext } from 'react';
import { FormFieldContext } from './formContext';
import { Field as ArrayField } from './useArrayField';
import { Field as ObjectField } from './useObjectField';
import { Form } from './useForm';
import { ArrayFieldAction } from './arrayFieldReducer';
import { ObjectFieldAction } from './objectFieldReducer';

export default function useParentField():
  | ArrayField<ArrayFieldAction>
  | Form
  | ObjectField<ObjectFieldAction> {
  return useContext(FormFieldContext);
}
