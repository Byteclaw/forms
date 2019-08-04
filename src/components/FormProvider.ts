import { ReactElement } from 'react';
import { FormState, useFormState } from '../hooks';

interface FormProviderProps<TValue extends { [key: string]: any }> {
  children: (formState: FormState<TValue>) => ReactElement | null;
}

export function FormProvider<TValue extends { [key: string]: any } = { [key: string]: any }>({
  children,
}: FormProviderProps<TValue>) {
  const [formState] = useFormState<TValue>();

  return children(formState);
}
