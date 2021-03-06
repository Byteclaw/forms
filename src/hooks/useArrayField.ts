import { useCallback, useEffect, useReducer, useRef, Dispatch, Reducer } from 'react';
import isEqual from 'react-fast-compare';
import {
  initArrayFieldState,
  arrayFieldReducer,
  ArrayFieldAction,
  ArrayFieldState,
} from '../reducers';
import { useFormState } from './useFormState';
import { useParentField } from './useParentField';
import { useValues } from './useValues';
import { useError } from './useError';

export function useArrayField<TValue extends any[] = any[]>(
  name: string | number,
  removeOnUnmount: boolean = false,
): [ArrayFieldState<TValue>, Dispatch<ArrayFieldAction<TValue>>] {
  const [formState] = useFormState();
  const [parentFieldState, parentFieldDispatch] = useParentField();
  const [initialValue, parentsValue] = useValues<TValue>(name.toString(), parentFieldState);
  const error = useError(name.toString(), parentFieldState);
  const [fieldState, fieldDispatch] = useReducer(
    arrayFieldReducer as Reducer<ArrayFieldState<TValue>, ArrayFieldAction<TValue>>,
    [initialValue, parentsValue] as [TValue | undefined, TValue | undefined],
    initArrayFieldState,
  );
  const currentState = useRef(fieldState);
  const previousParentsValue = useRef(parentsValue);

  const dispatch: Dispatch<ArrayFieldAction<TValue>> = useCallback(
    action => {
      if (formState.status === 'IDLE' || formState.status === 'CHANGING') {
        fieldDispatch(action);
      }
    },
    [formState.status],
  );

  if (currentState.current !== fieldState) {
    // propagate change
    if (currentState.current.changing !== fieldState.changing) {
      if (fieldState.changing) {
        parentFieldDispatch({ type: 'CHANGING', name: name.toString() });
      } /* else {
        parentFieldDispatch({
          type: 'CHANGE_FIELD',
          name: name.toString(),
          value: fieldState.value,
        });
      } */
    }

    if (!isEqual(currentState.current.value, fieldState.value)) {
      // this also sets the field as not changing
      parentFieldDispatch({
        type: 'CHANGE_FIELD',
        name: name.toString(),
        value: fieldState.value,
      });
    }

    currentState.current = fieldState;
  }

  // if initial value changes, set it
  if (!isEqual(initialValue, fieldState.initialValue)) {
    previousParentsValue.current = initialValue;

    fieldDispatch({ type: 'SET_INITIAL_VALUE', value: initialValue as TValue });
  } else if (!isEqual(previousParentsValue.current, parentsValue)) {
    previousParentsValue.current = parentsValue;

    if (parentsValue !== fieldState.value) {
      fieldDispatch({ type: 'SET_VALUE', value: parentsValue as TValue });
    }
  }

  // set field as changed on unmount
  useEffect(() => {
    return () => {
      parentFieldDispatch({
        type: 'CHANGE_FIELD',
        name: name.toString(),
        value: currentState.current.value,
      });

      if (removeOnUnmount) {
        parentFieldDispatch({ type: 'REMOVE_FIELD', name: name.toString() });
      }
    };
  }, [name, removeOnUnmount]);

  // if error is changed, propagate down
  if (error !== fieldState.error) {
    fieldDispatch({ type: 'SET_ERROR', error });
  }

  return [fieldState, dispatch];
}
