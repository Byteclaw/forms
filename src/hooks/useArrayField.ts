import { useCallback, useReducer, useRef, Dispatch, Reducer } from 'react';
import {
  initArrayFieldState,
  arrayFieldReducer,
  ArrayFieldAction,
  ArrayFieldState,
} from '../reducers';
import { useFormState } from './useFormState';
import { useParentField } from './useParentField';
import { useInitialValue } from './useInitialValue';
import { useError } from './useError';

export function useArrayField<TValue extends any[] = any[]>(
  name: string | number,
): [ArrayFieldState<TValue>, Dispatch<ArrayFieldAction<TValue>>] {
  const [formState] = useFormState();
  const [parentFieldState, parentFieldDispatch] = useParentField();
  const initialValue = useInitialValue<TValue>(name.toString(), parentFieldState);
  const error = useError(name.toString(), parentFieldState);
  const [fieldState, fieldDispatch] = useReducer(
    arrayFieldReducer as Reducer<ArrayFieldState<TValue>, ArrayFieldAction<TValue>>,
    initialValue,
    initArrayFieldState,
  );
  const previousState = useRef(fieldState);

  const dispatch: Dispatch<ArrayFieldAction<TValue>> = useCallback(
    action => {
      if (formState.status === 'IDLE' || formState.status === 'CHANGING') {
        fieldDispatch(action);
      }
    },
    [formState.status],
  );

  // if initial value changes, set it
  if (initialValue !== fieldState.initialValue) {
    fieldDispatch({ type: 'SET_INITIAL_VALUE', value: initialValue as TValue });
  }

  if (
    (formState.status === 'IDLE' || formState.status === 'CHANGING') &&
    previousState.current.value !== fieldState.value &&
    fieldState.value !== fieldState.initialValue
  ) {
    previousState.current = fieldState;
    // propagate change to parent only if is changed and is different than initial value
    parentFieldDispatch({ type: 'CHANGE_FIELD', name: name.toString(), value: fieldState.value });
  }

  // if error is changed, propagate down
  if (error !== fieldState.error) {
    fieldDispatch({ type: 'SET_ERROR', error });
  }

  return [fieldState, dispatch];
}
