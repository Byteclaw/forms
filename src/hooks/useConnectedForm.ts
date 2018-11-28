import { useContext } from 'react';
import { FormContext } from './formContext';

export { Form } from './useForm';

export default function useConnectedForm() {
  return useContext(FormContext);
}
