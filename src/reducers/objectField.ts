import isEqual from 'react-fast-compare';

export interface ObjectFieldState<TValue extends { [key: string]: any } = { [key: string]: any }> {
  changing: boolean;
  changingFields: { [key: string]: any };
  dirty: boolean;
  error: string | { [key: string]: any } | undefined;
  initialValue: TValue | undefined;
  valid: boolean;
  value: TValue | undefined;
}

export type ObjectFieldAction<TValue extends { [key: string]: any } = { [key: string]: any }> =
  | { type: 'CHANGING'; name: string }
  | {
      type: 'CHANGE_FIELD';
      name: keyof TValue;
      value: any;
    }
  | { type: 'REMOVE_FIELD'; name: string }
  | { type: 'SET_INITIAL_VALUE'; value: TValue }
  | { type: 'SET_VALUE'; value: TValue }
  | { type: 'SET_ERROR'; error: string | { [key: string]: any } | undefined };

export function initObjectFieldState<
  TValue extends { [key: string]: any } = { [key: string]: any }
>(initialValue: TValue | undefined): ObjectFieldState<TValue> {
  return {
    changing: false,
    changingFields: {},
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
    case 'CHANGING': {
      return {
        ...state,
        changing: true,
        changingFields: {
          ...state.changingFields,
          [action.name]: true,
        },
      };
    }
    case 'CHANGE_FIELD': {
      const { [action.name]: a, ...changingFields } = state.changingFields;
      const newValue = { ...state.value, [action.name]: action.value } as TValue;

      return {
        ...state,
        changing: Object.keys(changingFields).length > 0,
        changingFields,
        dirty: !isEqual(state.initialValue, newValue),
        value: newValue,
      };
    }
    case 'REMOVE_FIELD': {
      const { [action.name]: a, ...changingFields } = state.changingFields;
      const { [action.name]: aVal, ...restValues } = state.value || ({} as TValue);

      return {
        ...state,
        changing: Object.keys(changingFields).length > 0,
        changingFields,
        dirty: !isEqual(state.initialValue, restValues),
        value: restValues as TValue,
      };
    }
    /**
     * Set initial value is called if you change initial value on whole form
     */
    case 'SET_INITIAL_VALUE': {
      return {
        ...state,
        changing: false,
        changingFields: {},
        error: undefined,
        initialValue: action.value,
        dirty: false,
        valid: true,
        value: action.value,
      };
    }
    /**
     * Set value is basically called from parent's chain when you submit the form
     * And the validator returns "normalized" value
     */
    case 'SET_VALUE': {
      return {
        ...state,
        dirty: !isEqual(state.initialValue, action.value),
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
