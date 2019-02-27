export enum FieldActionType {
  SET_CHANGING = 'SET_CHANGING',
  SET_DIRTY = 'SET_DIRTY',
  SET_FOCUS = 'SET_FOCUS',
  CHANGE_VALUE = 'CHANGE_VALUE',
  SET_INITIAL_VALUE = 'SET_INITIAL_VALUE',
  SET_VALUE = 'SET_VALUE',
}

type SetChangingAction = {
  type: FieldActionType.SET_CHANGING;
  isChanging: boolean;
  name: string;
};

type SetDirtyAction = {
  type: FieldActionType.SET_DIRTY;
  isDirty: boolean;
  name: string;
};

type SetFocusAction = {
  type: FieldActionType.SET_FOCUS;
  isFocused: boolean;
  name: string;
};

type SetInitialValueAction = {
  type: FieldActionType.SET_INITIAL_VALUE;
  name: string;
  value: boolean;
};

type SetValueAction = {
  type: FieldActionType.SET_VALUE;
  name: string;
  value: any;
};

export type FieldAction =
  | SetChangingAction
  | SetDirtyAction
  | SetFocusAction
  | SetInitialValueAction
  | SetValueAction;

export interface FieldState<TValue = any> {
  changing: Set<string>;
  dirty: Set<string>;
  focused: Set<string>;
  initialValue: any;
  touched: Set<string>;
  value: TValue;
}

function addToSet<T>(set: Set<T>, value: T): Set<T> {
  if (set.has(value)) {
    return set;
  }

  return new Set([...set, value]);
}

function removeFromSet<T>(set: Set<T>, value: T): Set<T> {
  if (!set.has(value)) {
    return set;
  }

  return new Set([...set].filter(v => v !== value));
}

export function setDirty(state: FieldState, name: string, newValue: any): Set<string> {
  if (newValue !== state.initialValue) {
    return addToSet(state.dirty, name);
  }

  return removeFromSet(state.dirty, name);
}

export function fieldReducer<TFieldState extends FieldState = FieldState>(
  state: TFieldState,
  action: FieldAction,
): TFieldState {
  switch (action.type) {
    case FieldActionType.SET_CHANGING: {
      return {
        ...state,
        changing: action.isChanging
          ? addToSet(state.changing, action.name)
          : removeFromSet(state.changing, action.name),
      };
    }
    case FieldActionType.SET_DIRTY: {
      return {
        ...state,
        dirty: action.isDirty
          ? addToSet(state.dirty, action.name)
          : removeFromSet(state.dirty, action.name),
      };
    }
    case FieldActionType.SET_FOCUS: {
      if (action.isFocused) {
        return {
          ...state,
          focused: addToSet(state.focused, action.name),
          touched: addToSet(state.touched, action.name),
        };
      }

      return {
        ...state,
        focused: removeFromSet(state.focused, action.name),
      };
    }
    case FieldActionType.SET_INITIAL_VALUE: {
      return {
        ...state,
        initialValue: action.value,
      };
    }
    case FieldActionType.SET_VALUE: {
      return {
        ...state,
        dirty: setDirty(state, action.name, action.value),
        value: action.value,
      };
    }
    default: {
      return state;
    }
  }
}
