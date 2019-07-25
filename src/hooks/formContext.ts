import { Context, createContext } from 'react';
import { ArrayFieldAPI } from './useArrayField';
import { FormAPI } from './useForm';
import { ObjectFieldAPI } from './useObjectField';
import { ArrayFieldAction } from './arrayFieldReducer';
import { ObjectFieldAction } from './objectFieldReducer';

export const FormContext: Context<FormAPI> = createContext({} as any);
export const FormFieldContext: Context<
  ArrayFieldAPI<ArrayFieldAction> | FormAPI | ObjectFieldAPI<ObjectFieldAction>
> = createContext({} as any);
