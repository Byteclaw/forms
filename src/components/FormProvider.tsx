import { ReactElement, ReactNode } from 'react';
import { useConnectedForm, FormAPI } from '../hooks/useConnectedForm';

interface IProps {
  children: (form: FormAPI) => ReactNode;
}

export function FormProvider({ children }: IProps) {
  const form = useConnectedForm();

  return children(form) as ReactElement<any> | null;
}
