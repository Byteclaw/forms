export interface ObjectFieldState<TValue extends { [key: string]: any } = { [key: string]: any }> {
  dirty: boolean;
  error: string | { [key: string]: any } | undefined;
  initialValue: TValue | undefined;
  valid: boolean;
  value: TValue | undefined;
}

export type ObjectFieldAction<TValue extends { [key: string]: any } = { [key: string]: any }> =
  | {
      type: 'CHANGE_FIELD';
      name: keyof TValue;
      value: any;
    }
  | { type: 'SET_INITIAL_VALUE'; value: TValue }
  | { type: 'SET_ERROR'; error: string | { [key: string]: any } | undefined };

export function initObjectFieldState<
  TValue extends { [key: string]: any } = { [key: string]: any }
>(initialValue: TValue | undefined): ObjectFieldState<TValue> {
  return {
    error: undefined,
    dirty: false,
    initialValue,
    valid: true,
    value: initialValue,
  };
}

export function objectFieldReducer<TValue extends { [key: string]: any } = { [key: string]: any }>(
  state: ObjectFieldState<TValue>,
  action: ObjectFieldAction<TValue>,
): ObjectFieldState<TValue> {
  switch (action.type) {
    case 'CHANGE_FIELD': {
      if (state.value == null) {
        return {
          ...state,
          dirty: true,
          value: { [action.name]: action.value } as TValue,
        };
      }

      return {
        ...state,
        dirty: true,
        value: {
          ...state.value,
          [action.name]: action.value,
        },
      };
    }
    case 'SET_INITIAL_VALUE': {
      return {
        ...state,
        error: undefined,
        dirty: false,
        initialValue: action.value,
        valid: true,
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
