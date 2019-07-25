import { useContext } from 'react';
import { FormFieldContext } from './formContext';
import { ArrayFieldAPI } from './useArrayField';
import { ObjectFieldAPI } from './useObjectField';
import { FormAPI } from './useForm';
import { ArrayFieldAction } from './arrayFieldReducer';
import { ObjectFieldAction } from './objectFieldReducer';

export function useParentField():
  | ArrayFieldAPI<ArrayFieldAction>
  | FormAPI
  | ObjectFieldAPI<ObjectFieldAction> {
  return useContext(FormFieldContext);
}
