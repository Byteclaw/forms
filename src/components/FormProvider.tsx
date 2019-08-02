import { ReactElement, ReactNode } from 'react';
import { useConnectedForm, FormAPI } from '../hooks/useConnectedForm';

interface IProps<TValue extends { [key: string]: any }> {
  children: (form: FormAPI<TValue>) => ReactNode;
}

export function FormProvider<TValue extends { [key: string]: any } = { [key: string]: any }>({
  children,
}: IProps<TValue>) {
  const form = useConnectedForm();

  return children(form) as ReactElement<any> | null;
}
