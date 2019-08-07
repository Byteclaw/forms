import isEqual from 'react-fast-compare';
import { Dispatch, Reducer, useReducer, useRef } from 'react';
import {
  FormState,
  FormAction,
  formReducer,
  initFormState,
  ObjectFieldAction,
  ObjectFieldState,
} from '../reducers';
import { ValidationError } from './ValidationError';

export { FormState, FormAction, ObjectFieldState, ObjectFieldAction };

export function useForm<TValue extends { [key: string]: any } = { [key: string]: any }>(
  initialValue?: TValue,
  onChange?: (value: Partial<TValue> | undefined) => any,
  onSubmit?: (value: TValue) => Promise<void>,
  onValidate?: (value: Partial<TValue> | undefined) => Promise<TValue | void>,
  validateOnChange: boolean = false,
): [FormState<TValue>, Dispatch<FormAction<TValue>>] {
  const [state, dispatch] = useReducer(
    formReducer as Reducer<FormState<TValue>, FormAction<TValue>>,
    initialValue,
    initFormState,
  );
  const previousFormState = useRef(state);
  const previousValue = useRef(state.value);

  if (previousFormState.current !== state) {
    if (previousFormState.current.status !== state.status) {
      if (state.status === 'VALIDATING' || state.status === 'VALIDATING_ON_CHANGE') {
        dispatch({ type: 'SET_ERROR', error: undefined });

        const onValidatePromise = Promise.resolve(onValidate ? onValidate(state.value) : undefined);

        onValidatePromise
          .then(value => {
            dispatch({ type: 'VALIDATING_DONE', value: value || undefined });
          })
          .catch(e => {
            // process validation error
            if (e instanceof ValidationError) {
              dispatch({ type: 'VALIDATING_FAILED', error: e.errors });
            } else if (e instanceof Error) {
              dispatch({ type: 'VALIDATING_FAILED', error: { '': e.message } });
            } else {
              dispatch({ type: 'VALIDATING_FAILED', error: { '': '' + e } });
            }
          });
      } else if (state.status === 'SUBMITTING') {
        // SUBMITTING won't be called if value of form is undefined
        const onSubmitPromise = Promise.resolve(onSubmit ? onSubmit(state.value!) : undefined);

        onSubmitPromise
          .then(() => {
            dispatch({ type: 'SUBMITTING_DONE' });
          })
          .catch(e => {
            // process validation error
            if (e instanceof ValidationError) {
              dispatch({ type: 'SUBMITTING_FAILED', error: e.errors });
            } else if (e instanceof Error) {
              dispatch({ type: 'SUBMITTING_FAILED', error: { '': e.message } });
            } else {
              dispatch({ type: 'SUBMITTING_FAILED', error: { '': '' + e } });
            }
          });
      }
    }

    if (state.status === 'IDLE') {
      if (!isEqual(previousValue.current, state.value)) {
        previousValue.current = state.value;

        if (onChange) {
          onChange(state.value);
        }

        if (validateOnChange) {
          dispatch({ type: 'VALIDATE' });
        }
      }
    }

    previousFormState.current = state;
  }

  // if form is idle or changing and initial value changed, reset everything
  if (
    !isEqual(state.initialValue, initialValue) &&
    (state.status === 'IDLE' || state.status === 'CHANGING')
  ) {
    dispatch({ type: 'SET_INITIAL_VALUE', value: initialValue as TValue });
  }

  return [state, dispatch];
}
