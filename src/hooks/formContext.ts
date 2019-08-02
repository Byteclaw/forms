import { Context, createContext } from 'react';
import { ArrayFieldAPI } from './useArrayField';
import { FormAPI } from './useForm';
import { ObjectFieldAPI } from './useObjectField';
import { ArrayFieldAction } from './arrayFieldReducer';
import { ObjectFieldAction } from './objectFieldReducer';

export const FormContext: Context<FormAPI<any>> = createContext({} as any);
export const FormFieldContext: Context<
  ArrayFieldAPI<any[], ArrayFieldAction> | FormAPI<any> | ObjectFieldAPI<any, ObjectFieldAction>
> = createContext({} as any);
