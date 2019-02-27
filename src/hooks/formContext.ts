import { Context, createContext } from 'react';
import { Field as ArrayField } from './useArrayField';
import { Form } from './useForm';
import { Field as ObjectField } from './useObjectField';
import { ArrayFieldAction } from './arrayFieldReducer';
import { ObjectFieldAction } from './objectFieldReducer';

export const FormContext: Context<Form> = createContext({} as any);
export const FormFieldContext: Context<
  ArrayField<ArrayFieldAction> | Form | ObjectField<ObjectFieldAction>
> = createContext({} as any);
