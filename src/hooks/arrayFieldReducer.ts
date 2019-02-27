import { FieldAction, fieldReducer, FieldState, setDirty } from './fieldReducer';

export enum ArrayFieldActionEnum {
  ADD_VALUE = 'ADD_VALUE',
  REMOVE_VALUE = 'REMOVE_VALUE',
  REMOVE_LAST_VALUE = 'REMOVE_LAST_VALUE',
  SET_VALUE_AT_INDEX = 'SET_VALUE_AT_INDEX',
}

// array actions
export type AddValueAction = {
  type: ArrayFieldActionEnum.ADD_VALUE;
  name: string;
  value: any;
};

export type RemoveValueAction = {
  type: ArrayFieldActionEnum.REMOVE_VALUE;
  index: number;
  name: string;
};

export type RemoveLastValueAction = {
  type: ArrayFieldActionEnum.REMOVE_LAST_VALUE;
  name: string;
};

export type SetValueAtIndexAction = {
  type: ArrayFieldActionEnum.SET_VALUE_AT_INDEX;
  index: number;
  name: string;
  value: any;
};

export type ArrayFieldAction =
  | FieldAction
  | AddValueAction
  | RemoveValueAction
  | RemoveLastValueAction
  | SetValueAtIndexAction;

export function arrayFieldReducer(
  state: FieldState<any[]>,
  action: ArrayFieldAction,
): FieldState<any[]> {
  switch (action.type) {
    case ArrayFieldActionEnum.ADD_VALUE: {
      const value = Array.isArray(state.value) ? [...state.value, action.value] : [action.value];

      return {
        ...state,
        dirty: setDirty(state, action.name, value),
        value,
      };
    }
    case ArrayFieldActionEnum.REMOVE_LAST_VALUE: {
      const value = state.value.slice(0, -1);

      return {
        ...state,
        dirty: setDirty(state, action.name, value),
        value,
      };
    }
    case ArrayFieldActionEnum.REMOVE_VALUE: {
      const value = [...state.value.slice(0, action.index), ...state.value.slice(action.index + 1)];

      return {
        ...state,
        dirty: setDirty(state, action.name, value),
        value,
      };
    }
    case ArrayFieldActionEnum.SET_VALUE_AT_INDEX: {
      const value = state.value.slice();
      value[action.index] = action.value;

      return {
        ...state,
        dirty: setDirty(state, action.name, value),
        value,
      };
    }
    default: {
      return fieldReducer(state, action);
    }
  }
}
