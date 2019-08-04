import { useMemo } from 'react';
import { ParentFieldState } from './useParentField';

export function useInitialValue<TValue = any>(
  name: string,
  parentField: ParentFieldState,
): TValue | undefined {
  return useMemo(() => {
    if (parentField.initialValue == null) {
      return undefined;
    }

    if (Array.isArray(parentField.initialValue)) {
      return parentField.initialValue[Number(name)];
    }

    return parentField.initialValue[name];
  }, [name, parentField.initialValue]);
}
