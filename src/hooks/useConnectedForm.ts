import { useContext } from 'react';
import { FormContext } from './formContext';

export { FormAPI } from './useForm';

export function useConnectedForm() {
  return useContext(FormContext);
}
