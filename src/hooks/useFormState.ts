import { createContext, Dispatch, useContext } from 'react';
import { FormState, FormAction } from '../reducers';

export const FormStateContext = createContext<
  [FormState<{ [key: string]: any }>, Dispatch<FormAction<{ [key: string]: any }>>]
>(undefined as any);

export function useFormState<TValue extends { [key: string]: any } = { [key: string]: any }>(): [
  FormState<TValue>,
  Dispatch<FormAction<TValue>>,
] {
  return useContext(FormStateContext) as any;
}
