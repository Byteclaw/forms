import { useMemo } from 'react';
import { ParentFieldState } from './useParentField';

export function useError(
  name: string,
  parentField: ParentFieldState,
): string | undefined | { [key: string]: any } {
  return useMemo(() => {
    if (!parentField.error) {
      return undefined;
    }

    if (name === '') {
      if (typeof parentField.error === 'string') {
        return parentField.error;
      }

      return parentField.error[name];
    }

    // do not return parent's error for nested field
    if (typeof parentField.error === 'string') {
      return undefined;
    }

    if (Array.isArray(parentField.error)) {
      return parentField.error[Number(name)];
    }

    return parentField.error[name];
  }, [name, parentField.error]);
}
