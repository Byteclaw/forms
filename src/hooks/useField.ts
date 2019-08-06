import { Dispatch, Reducer, useCallback, useEffect, useReducer, useRef } from 'react';
import { useDebouncedCallback } from './useDebouncedCallback';
import { useFormState } from './useFormState';
import { useParentField } from './useParentField';
import { fieldReducer, FieldAction, FieldState, initFieldReducer } from '../reducers';
import { useValues } from './useValues';
import { useError } from './useError';

export { FieldState, FieldAction };

export function useField<TValue = any>(
  name: string,
  debounceDelay: number = 300,
): [FieldState<TValue>, Dispatch<FieldAction<TValue>>] {
  const [formState, formDispatch] = useFormState();
  const [parentFieldState, parentFieldDispatch] = useParentField();
  const [initialValue, parentsValue] = useValues<TValue>(name, parentFieldState);
  const error = useError(name, parentFieldState);
  const [fieldState, fieldDispatch] = useReducer(
    fieldReducer as Reducer<FieldState<TValue>, FieldAction<TValue>>,
    initialValue,
    initFieldReducer,
  );

  const changingRef = useRef(false);
  const previousParentsValue = useRef(parentsValue);

  const [propagateChanged, cancelChangedPropagation] = useDebouncedCallback(
    (value: TValue) => {
      changingRef.current = false;
      formDispatch({ type: 'CHANGED' });
      parentFieldDispatch({ type: 'CHANGE_FIELD', name, value });
    },
    debounceDelay,
    [],
  );

  const dispatch = useCallback(
    (action: FieldAction<TValue>) => {
      if (formState.status === 'IDLE' || formState.status === 'CHANGING') {
        if (action.type === 'CHANGE') {
          // notify form about pending change
          if (changingRef.current === false) {
            // set as changing
            changingRef.current = true;
            // propagate change to form
            formDispatch({ type: 'CHANGING' });
          }

          // propagate change to parent field and form
          propagateChanged(action.value);
        }

        fieldDispatch(action);
      }
    },
    [formState.status, formDispatch, fieldDispatch],
  );

  useEffect(() => {
    return () => {
      // cancel changed propagation
      cancelChangedPropagation();

      if (changingRef.current) {
        changingRef.current = false;
        formDispatch({ type: 'CHANGED' });
      }
    };
  }, []);

  // if initial value changes, set it
  if (initialValue !== fieldState.initialValue) {
    fieldDispatch({ type: 'SET_INITIAL_VALUE', value: initialValue as TValue });
  }

  // if value from parent changes, set it's value
  if (previousParentsValue.current !== parentsValue) {
    previousParentsValue.current = parentsValue;

    if (parentsValue !== fieldState.value) {
      fieldDispatch({ type: 'SET_VALUE', value: parentsValue as TValue });
    }
  }

  // if error is changed, propagate down
  if (error !== fieldState.error) {
    fieldDispatch({ type: 'SET_ERROR', error: error as string });
  }

  return [fieldState, dispatch];
}
