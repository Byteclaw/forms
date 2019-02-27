import { FieldAction, fieldReducer, FieldState, setDirty } from './fieldReducer';

export enum ObjectFieldActionEnum {
  SET_FIELD = 'SET_FIELD',
}

export type SetFieldAction = {
  type: ObjectFieldActionEnum.SET_FIELD;
  field: string;
  name: string;
  value: any;
};

export type ObjectFieldAction = FieldAction | SetFieldAction;

export function objectFieldReducer(
  state: FieldState<{ [key: string]: any }>,
  action: ObjectFieldAction,
): FieldState<{ [key: string]: any }> {
  switch (action.type) {
    case ObjectFieldActionEnum.SET_FIELD: {
      const value = { ...state.value, [action.field]: action.value };

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
