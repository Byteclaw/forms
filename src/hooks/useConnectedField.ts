import { useParentField } from './useParentField';

export interface IFieldReadOnly {
  dirty: boolean;
  error: void | string;
  focused: boolean;
  touched: boolean;
  valid: boolean;
}

export function useConnectedField(name: string | number = ''): IFieldReadOnly {
  const field = useParentField();
  const error = field.getError(name);

  return {
    dirty: field.isDirty(name),
    error,
    focused: field.isFocused(name),
    touched: field.isTouched(name),
    valid: error == null,
  };
}
