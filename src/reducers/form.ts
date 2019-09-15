/* eslint-disable no-nested-ternary */
import {
  initObjectFieldState,
  ObjectFieldAction,
  ObjectFieldState,
  objectFieldReducer,
} from './objectField';

export interface FormState<TValue extends { [key: string]: any }> extends ObjectFieldState<TValue> {
  status: 'IDLE' | 'CHANGING' | 'SUBMITTING' | 'VALIDATING' | 'VALIDATING_ON_CHANGE';
}

export type FormAction<TValue extends { [key: string]: any }> =
  | { type: 'SUBMIT' }
  | { type: 'SUBMITTING_DONE' }
  | { type: 'SUBMITTING_FAILED'; error: string | { [key: string]: any } | undefined }
  | { type: 'VALIDATE' }
  | { type: 'VALIDATING_DONE'; value?: TValue }
  | { type: 'VALIDATING_FAILED'; error: string | { [key: string]: any } | undefined }
  | ObjectFieldAction<TValue>
  | {
      type: 'CHANGE_FIELD';
      name: keyof TValue;
      value: any;
      validateOnChange: boolean;
    };

export function initFormState<TValue extends { [key: string]: any }>(
  initialValue: TValue | undefined,
): FormState<TValue> {
  return {
    status: 'IDLE',
    ...initObjectFieldState([initialValue, undefined]),
  };
}

export function formReducer<TValue extends { [key: string]: any } = { [key: string]: any }>(
  state: FormState<TValue>,
  action: FormAction<TValue>,
): FormState<TValue> {
  switch (action.type) {
    case 'CHANGING':
      if (state.status === 'IDLE' || state.status === 'CHANGING') {
        const nextState = objectFieldReducer(state, action);

        return {
          ...nextState,
          status: nextState.changing ? 'CHANGING' : 'IDLE',
        };
      }

      return state;
    case 'CHANGE_FIELD': {
      if (state.status === 'IDLE' || state.status === 'CHANGING') {
        const nextState = objectFieldReducer(state, action);

        return {
          ...nextState,
          status: nextState.changing
            ? 'CHANGING'
            : (action as any).validateOnChange
            ? 'VALIDATING_ON_CHANGE'
            : 'IDLE',
        };
      }

      return state;
    }
    case 'SUBMIT': {
      if (state.status !== 'IDLE') {
        return state;
      }

      return {
        ...state,
        error: undefined,
        status: 'VALIDATING',
        valid: true,
      };
    }
    case 'VALIDATE': {
      if (state.status !== 'IDLE') {
        return state;
      }

      return {
        ...state,
        error: undefined,
        status: 'VALIDATING_ON_CHANGE',
        valid: true,
      };
    }
    case 'VALIDATING_DONE': {
      if (state.status === 'VALIDATING') {
        if (state.value == null && action.value == null) {
          return {
            ...state,
            status: 'IDLE',
          };
        }

        return {
          ...state,
          status: 'SUBMITTING',
          value: action.value ? action.value : state.value,
        };
      }

      if (state.status === 'VALIDATING_ON_CHANGE') {
        return {
          ...state,
          status: 'IDLE',
          value: action.value ? action.value : state.value,
        };
      }

      return state;
    }
    case 'VALIDATING_FAILED': {
      if (state.status === 'VALIDATING' || state.status === 'VALIDATING_ON_CHANGE') {
        return {
          ...state,
          error: action.error,
          status: 'IDLE',
          valid: action.error == null,
        };
      }

      return state;
    }
    case 'SUBMITTING_DONE': {
      if (state.status !== 'SUBMITTING') {
        return state;
      }

      return {
        ...state,
        status: 'IDLE',
      };
    }
    case 'SUBMITTING_FAILED': {
      if (state.status !== 'SUBMITTING') {
        return state;
      }

      return {
        ...state,
        error: action.error,
        status: 'IDLE',
        valid: action.error == null,
      };
    }
    default:
      return objectFieldReducer(state, action) as FormState<TValue>;
  }
}
