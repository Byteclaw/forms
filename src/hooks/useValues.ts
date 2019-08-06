import { useMemo } from 'react';
import { ParentFieldState } from './useParentField';

/**
 * Returns tuple with initial value and current value
 */
export function useValues<TValue = any>(
  name: string,
  parentField: ParentFieldState,
): [TValue | undefined, TValue | undefined] {
  return useMemo(() => {
    let initialValue: TValue | undefined;
    let value: TValue | undefined;

    if (parentField.initialValue == null) {
      initialValue = undefined;
    } else if (Array.isArray(parentField.initialValue)) {
      initialValue = parentField.initialValue[Number(name)];
    } else {
      initialValue = parentField.initialValue[name];
    }

    if (parentField.value == null) {
      value = undefined;
    } else if (Array.isArray(parentField.value)) {
      value = parentField.value[Number(name)];
    } else {
      value = parentField.value[name];
    }

    return [initialValue, value];
  }, [name, parentField.initialValue, parentField.value]);
}
