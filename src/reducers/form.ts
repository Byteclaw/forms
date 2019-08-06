import {
  initObjectFieldState,
  ObjectFieldAction,
  ObjectFieldState,
  objectFieldReducer,
} from './objectField';

export interface FormState<TValue extends { [key: string]: any }> extends ObjectFieldState<TValue> {
  status: 'IDLE' | 'CHANGING' | 'SUBMITTING' | 'VALIDATING' | 'VALIDATING_ON_CHANGE';
  changingCount: number;
}

export type FormAction<TValue extends { [key: string]: any }> =
  | { type: 'CHANGING' }
  | { type: 'CHANGED' }
  | { type: 'SUBMIT' }
  | { type: 'SUBMITTING_DONE' }
  | { type: 'SUBMITTING_FAILED' }
  | { type: 'VALIDATE' }
  | { type: 'VALIDATING_DONE' }
  | { type: 'VALIDATING_FAILED' }
  | ObjectFieldAction<TValue>;

export function initFormState<TValue extends { [key: string]: any }>(
  initialValue: TValue | undefined,
): FormState<TValue> {
  return {
    status: 'IDLE',
    changingCount: 0,
    ...initObjectFieldState(initialValue),
  };
}

export function formReducer<TValue extends { [key: string]: any } = { [key: string]: any }>(
  state: FormState<TValue>,
  action: FormAction<TValue>,
): FormState<TValue> {
  switch (action.type) {
    case 'CHANGING':
      if (state.status === 'IDLE' || state.status === 'CHANGING') {
        return {
          ...state,
          status: 'CHANGING',
          changingCount: state.changingCount + 1,
        };
      }

      return state;
    case 'CHANGED': {
      if (state.status === 'IDLE' || state.status === 'CHANGING') {
        const changingCount = state.changingCount - 1;

        return {
          ...state,
          status: changingCount === 0 ? 'IDLE' : 'CHANGING',
          changingCount,
        };
      }

      return state;
    }
    case 'SUBMIT': {
      if (state.status !== 'IDLE' || state.value == null) {
        return state;
      }

      return {
        ...state,
        status: 'VALIDATING',
      };
    }
    case 'VALIDATE': {
      if (state.status !== 'IDLE') {
        return state;
      }

      return {
        ...state,
        status: 'VALIDATING_ON_CHANGE',
      };
    }
    case 'VALIDATING_DONE': {
      if (state.status === 'VALIDATING') {
        return {
          ...state,
          status: 'SUBMITTING',
        };
      }

      if (state.status === 'VALIDATING_ON_CHANGE') {
        return {
          ...state,
          status: 'IDLE',
        };
      }

      return state;
    }
    case 'VALIDATING_FAILED': {
      if (state.status === 'VALIDATING' || state.status === 'VALIDATING_ON_CHANGE') {
        return {
          ...state,
          status: 'IDLE',
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
        status: 'IDLE',
      };
    }
    default:
      return objectFieldReducer(state, action) as FormState<TValue>;
  }
}
