import { useCallback, useEffect, useReducer, useRef, Dispatch, Reducer } from 'react';
import isEqual from 'react-fast-compare';
import {
  initObjectFieldState,
  objectFieldReducer,
  ObjectFieldAction,
  ObjectFieldState,
} from '../reducers';
import { useFormState } from './useFormState';
import { useParentField } from './useParentField';
import { useValues } from './useValues';
import { useError } from './useError';

export function useObjectField<TValue extends { [key: string]: any } = { [key: string]: any }>(
  name: string,
  removeOnUnmount: boolean = false,
): [ObjectFieldState<TValue>, Dispatch<ObjectFieldAction<TValue>>] {
  const [formState] = useFormState();
  const [parentFieldState, parentFieldDispatch] = useParentField();
  const [initialValue, parentsValue] = useValues<TValue>(name, parentFieldState);
  const error = useError(name, parentFieldState);
  const [fieldState, fieldDispatch] = useReducer(
    objectFieldReducer as Reducer<ObjectFieldState<TValue>, ObjectFieldAction<TValue>>,
    initialValue,
    initObjectFieldState,
  );
  const currentStateRef = useRef(fieldState);
  const currentParentsValueRef = useRef(parentsValue);

  const dispatch: Dispatch<ObjectFieldAction<TValue>> = useCallback(
    action => {
      if (formState.status === 'IDLE' || formState.status === 'CHANGING') {
        fieldDispatch(action);
      }
    },
    [formState.status],
  );

  if (currentStateRef.current !== fieldState) {
    // propagate change
    if (currentStateRef.current.changing !== fieldState.changing) {
      if (fieldState.changing) {
        parentFieldDispatch({ type: 'CHANGING', name });
      } /* else {
        parentFieldDispatch({ type: 'CHANGE_FIELD', name, value: fieldState.value });
      } */
    }

    // propagate value change
    if (!isEqual(currentStateRef.current.value, fieldState.value)) {
      // this also sets the field as not changing
      parentFieldDispatch({ type: 'CHANGE_FIELD', name, value: fieldState.value });
    }

    currentStateRef.current = fieldState;
  }

  // if initial value changes, set it
  if (!isEqual(initialValue, fieldState.initialValue)) {
    fieldDispatch({ type: 'SET_INITIAL_VALUE', value: initialValue as TValue });
  } else if (!isEqual(currentParentsValueRef.current, parentsValue)) {
    currentParentsValueRef.current = parentsValue;

    if (parentsValue !== fieldState.value) {
      fieldDispatch({ type: 'SET_VALUE', value: parentsValue as TValue });
    }
  }

  // set field as changed on unmount
  useEffect(() => {
    return () => {
      parentFieldDispatch({ type: 'CHANGE_FIELD', name, value: currentStateRef.current.value });

      if (removeOnUnmount) {
        parentFieldDispatch({ type: 'REMOVE_FIELD', name });
      }
    };
  }, [name, removeOnUnmount]);

  // if error is changed, propagate down
  if (error !== fieldState.error) {
    fieldDispatch({ type: 'SET_ERROR', error });
  }

  return [fieldState, dispatch];
}
