import isEqual from 'react-fast-compare';

export interface ArrayFieldState<TValue extends any[] = any[]> {
  changing: boolean;
  changingFields: { [key: string]: any };
  dirty: boolean;
  error: string | { [key: string]: any } | undefined;
  initialValue: TValue | undefined;
  valid: boolean;
  value: TValue | undefined;
}

export type ArrayFieldAction<TValue extends any[] = any[]> =
  | { type: 'CHANGING'; name: number | string }
  | {
      type: 'CHANGE_FIELD';
      name: number | string;
      value: TValue extends (infer I)[] ? I : any;
    }
  | { type: 'SET_INITIAL_VALUE'; value: TValue }
  | { type: 'SET_VALUE'; value: TValue }
  | { type: 'SET_ERROR'; error: string | { [key: string]: any } | undefined };

export function initArrayFieldState<TValue extends any[] = any[]>(
  initialValue: TValue | undefined,
): ArrayFieldState<TValue> {
  return {
    changing: false,
    changingFields: new Set(),
    error: undefined,
    dirty: false,
    initialValue,
    valid: true,
    value: initialValue,
  };
}

export function arrayFieldReducer<TValue extends any[] = any[]>(
  state: ArrayFieldState<TValue>,
  action: ArrayFieldAction<TValue>,
): ArrayFieldState<TValue> {
  switch (action.type) {
    case 'CHANGING': {
      return {
        ...state,
        changing: true,
        changingFields: {
          ...state.changingFields,
          [action.name.toString()]: true,
        },
      };
    }
    case 'CHANGE_FIELD': {
      const { [action.name.toString()]: a, ...changingFields } = state.changingFields;

      if (state.value == null) {
        const value = ([] as any) as TValue;

        value[Number(action.name)] = action.value;

        return {
          ...state,
          changing: Object.keys(changingFields).length > 0,
          changingFields,
          dirty: state.initialValue !== value,
          value,
        };
      }

      const value = state.value.slice() as TValue;

      value[Number(action.name)] = action.value;

      return {
        ...state,
        changing: Object.keys(changingFields).length > 0,
        changingFields,
        dirty: state.initialValue !== value,
        value,
      };
    }
    /**
     * Set initial value is called if you change initial value on whole form
     */
    case 'SET_INITIAL_VALUE': {
      return {
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
