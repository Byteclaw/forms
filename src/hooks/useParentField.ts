import { createContext, Dispatch, useContext } from 'react';

export interface ParentFieldState<TValue = any[] | { [key: string]: any }> {
  error: string | { [key: string]: any } | undefined;
  dirty: boolean;
  initialValue: TValue | undefined;
  valid: boolean;
  value: TValue | undefined;
}

export type ParentFieldAction =
  | { type: 'CHANGING'; name: string }
  | { type: 'CHANGE_FIELD'; name: string; value: any }
  | { type: 'REMOVE_FIELD'; name: string };

export const CompositeFieldContext = createContext<
  [ParentFieldState<any>, Dispatch<ParentFieldAction>]
>(undefined as any);

CompositeFieldContext.displayName = 'FormCompositeFieldContext';

export function useParentField<TValue = any[] | { [key: string]: any }>(): [
  ParentFieldState<TValue>,
  Dispatch<ParentFieldAction>,
] {
  return useContext(CompositeFieldContext);
}
