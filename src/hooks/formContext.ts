import { Context, createContext } from 'react';
import { Field as ArrayField } from './useArrayField';
import { Form } from './useForm';
import { Field as ObjectField } from './useObjectField';

export const FormContext: Context<Form> = createContext({} as any);
export const FormFieldContext: Context<ArrayField | Form | ObjectField> = createContext({} as any);
