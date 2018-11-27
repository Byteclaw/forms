import { ReactElement, ReactNode } from 'react';
import useConnectedForm, { Form } from '../hooks/useConnectedForm';

interface IProps {
  children: (form: Form) => ReactNode;
}

export default function FormProvider({ children }: IProps) {
  const form = useConnectedForm();

  return children(form) as ReactElement<any> | null;
}
