import { Dispatch, Reducer, useEffect, useReducer, useRef } from 'react';
import {
  FormState,
  FormAction,
  formReducer,
  initFormState,
  ObjectFieldAction,
  ObjectFieldState,
} from '../reducers';
import { ValidationError } from './ValidationError';
import { useDebouncedCallback } from './useDebouncedCallback';

export { FormState, FormAction, ObjectFieldState, ObjectFieldAction };

export function useForm<TValue extends { [key: string]: any } = { [key: string]: any }>(
  initialValue?: TValue,
  onSubmit?: (value: TValue) => Promise<void>,
  onValidate?: (value: TValue) => Promise<void>,
  validateOnChange: boolean = false,
): [FormState<TValue>, Dispatch<FormAction<TValue>>] {
  const [state, dispatch] = useReducer(
    formReducer as Reducer<FormState<TValue>, FormAction<TValue>>,
    initialValue,
    initFormState,
  );
  const [propagateValidateOnChange, cancelValidateOnChange] = useDebouncedCallback(
    () => dispatch({ type: 'VALIDATE' }),
    100,
    [],
  );
  const previousFormState = useRef(state);

  // cancel validate on change propagation
  useEffect(() => {
    return () => {
      cancelValidateOnChange();
    };
  }, [validateOnChange]);

  if (previousFormState.current !== state) {
    if (previousFormState.current.status !== state.status) {
      if (state.status === 'VALIDATING' || state.status === 'VALIDATING_ON_CHANGE') {
        dispatch({ type: 'SET_ERROR', error: undefined });

        // VALIDATING won't be called if value of form is undefined
        if (onValidate) {
          onValidate(state.value!)
            .then(() => {
              dispatch({ type: 'VALIDATING_DONE' });
            })
            .catch(e => {
              // process validation error
              if (e instanceof ValidationError) {
                dispatch({ type: 'SET_ERROR', error: e.errors });
              } else if (e instanceof Error) {
                dispatch({ type: 'SET_ERROR', error: { '': e.message } });
              } else {
                dispatch({ type: 'SET_ERROR', error: { '': '' + e } });
              }

              dispatch({ type: 'VALIDATING_FAILED' });
            });
        } else {
          dispatch({ type: 'VALIDATING_DONE' });
        }
      } else if (state.status === 'SUBMITTING') {
        // SUBMITTING won't be called if value of form is undefined
        if (onSubmit) {
          onSubmit(state.value!)
            .then(() => {
              dispatch({ type: 'SUBMITTING_DONE' });
            })
            .catch(e => {
              // process validation error
              if (e instanceof ValidationError) {
                dispatch({ type: 'SET_ERROR', error: e.errors });
              } else if (e instanceof Error) {
                dispatch({ type: 'SET_ERROR', error: { '': e.message } });
              } else {
                dispatch({ type: 'SET_ERROR', error: { '': '' + e } });
              }

              dispatch({ type: 'SUBMITTING_FAILED' });
            });
        } else {
          dispatch({ type: 'SUBMITTING_DONE' });
        }
      }
    }

    if (previousFormState.current.value !== state.value && validateOnChange) {
      propagateValidateOnChange();
    }

    previousFormState.current = state;
  }

  // if form is idle or changing and initial value changed, reset everything
  if (
    state.initialValue !== initialValue &&
    (state.status === 'IDLE' || state.status === 'CHANGING')
  ) {
    dispatch({ type: 'SET_INITIAL_VALUE', value: initialValue as TValue });
  }

  return [state, dispatch];
}
