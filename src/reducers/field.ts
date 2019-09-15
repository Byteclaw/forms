export interface FieldState<TValue = any> {
  error: string | undefined;
  dirty: boolean;
  focused: boolean;
  initialValue: TValue | undefined;
  touched: boolean;
  previousValue: TValue | undefined;
  valid: boolean;
  value: TValue | undefined;
}

export type FieldAction<TValue = any> =
  | { type: 'CHANGE'; value: TValue }
  | { type: 'FOCUS' }
  | { type: 'BLUR' }
  | { type: 'SET_INITIAL_VALUE'; value: TValue }
  | { type: 'SET_VALUE'; value: TValue }
  | { type: 'SET_ERROR'; error: string | undefined };

export function initFieldReducer<TValue = any>([initialValue, value]: [
  TValue | undefined,
  TValue | undefined,
]): FieldState<TValue> {
  return {
    error: undefined,
    focused: false,
    dirty: false,
    initialValue,
    previousValue: initialValue,
    touched: false,
    valid: true,
    value: value || initialValue,
  };
}

export function fieldReducer<TValue = any>(
  state: FieldState<TValue>,
  action: FieldAction<TValue>,
): FieldState<TValue> {
  switch (action.type) {
    case 'CHANGE':
      return {
        ...state,
        dirty: state.initialValue !== action.value,
        previousValue: state.value,
        touched: true,
        value: action.value,
      };
    case 'FOCUS':
      return {
        ...state,
        focused: true,
        touched: true,
      };
    case 'BLUR':
      return {
        ...state,
        focused: false,
      };
    case 'SET_INITIAL_VALUE': {
      // set initial value means, that initial value has changed
      // and we want to reset field to this value
      // this meanse that outer initialValues of form has changed and we want to reset this form
      return {
        ...state,
        initialValue: action.value,
        dirty: false,
        previousValue: action.value,
        touched: false,
        valid: true,
        value: action.value,
      };
    }
    case 'SET_VALUE': {
      return {
        ...state,
        dirty: action.value !== state.initialValue,
        value: action.value,
      };
    }
    case 'SET_ERROR': {
      return {
        ...state,
        error: action.error,
        valid: action.error == null,
      };
    }
    default:
      return state;
  }
}
