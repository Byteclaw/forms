import { ReactElement } from 'react';
import { FormState, useFormState } from '../hooks';

export interface FormProviderRenderer<TValue extends { [key: string]: any }> {
  (formState: FormState<TValue>): ReactElement | null;
}

export interface FormProviderProps<TValue extends { [key: string]: any }> {
  children: FormProviderRenderer<TValue>;
}

export function FormProvider<TValue extends { [key: string]: any } = { [key: string]: any }>({
  children,
}: FormProviderProps<TValue>) {
  const [formState] = useFormState<TValue>();

  return children(formState);
}
