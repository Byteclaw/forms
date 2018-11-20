// @flow

import useParentField from './useParentField';

export type Field = {
  dirty: boolean,
  error: ?string,
  focused: boolean,
  touched: boolean,
  valid: boolean,
};

export default function useConnectedField(name?: string | number = ''): Field {
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
