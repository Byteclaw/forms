import { useCallback } from 'react';
import { FormFieldContext } from './formContext';
import { IField as IScalarField, IFieldSettings, useField } from './useField';
import {
  ArrayFieldActionEnum,
  arrayFieldReducer,
  ArrayFieldAction,
  AddValueAction,
  RemoveValueAction,
  RemoveLastValueAction,
  SetValueAtIndexAction,
} from './arrayFieldReducer';
import { FieldState } from './fieldReducer';

type AddItemFn = (value: any) => void;
type GetErrorFn = (field: string | number) => void | string;
type GetItemFn = (index: number | string) => any;
type RemoveLastItemFn = () => void;
type RemoveItemFn = (index: number) => void;
type SetItemFn = (index: number | string, value: any) => void;

export type Field<TActions> = IScalarField<TActions> & {
  addItem: AddItemFn;
  getError: GetErrorFn;
  getInitialItem: GetItemFn;
  getItem: GetItemFn;
  kind: 'ARRAY';
  removeItem: RemoveItemFn;
  removeLastItem: RemoveLastItemFn;
  setItem: SetItemFn;
} & IFieldComponents;

interface IFieldComponents {
  Provider: typeof FormFieldContext['Provider'];
}

const defaultInitialState: any[] = [];

export function useArrayField<
  TFieldState extends FieldState<any[]> = FieldState<any[]>,
  TFieldActions extends ArrayFieldAction = ArrayFieldAction
>(
  currentValue?: any[],
  initialValue: any[] = defaultInitialState,
  errors?: string | { [key: string]: string } | undefined,
  settings?: IFieldSettings<TFieldState, TFieldActions>,
): Field<TFieldActions> {
  const field = useField<TFieldState, TFieldActions>(currentValue, initialValue, errors, {
    enableReinitialize: false,
    reducer: arrayFieldReducer as any,
    ...settings,
  });
  const getError = useCallback(
    fieldName => {
      if (field.errors == null || typeof field.errors === 'string') {
        return undefined;
      }

      return field.errors[fieldName];
    },
    [field.errors],
  );
  const getItem = useCallback(fieldName => (field.value ? field.value[fieldName] : undefined), [
    field,
  ]);
  const getInitialItem = useCallback(
    fieldName => (field.initialValue ? field.initialValue[fieldName] : undefined),
    [field],
  );
  const addItem = useCallback(
    (value: any) => {
      field.setChanging(true);
      field.dispatch(({
        type: ArrayFieldActionEnum.ADD_VALUE,
        name: '',
        value,
      } as AddValueAction) as any);
    },
    [field.dispatch, field.setChanging],
  );
  const removeItem = useCallback(
    (index: number) => {
      field.setChanging(true);
      field.dispatch(({
        type: ArrayFieldActionEnum.REMOVE_VALUE,
        name: '',
        index,
      } as RemoveValueAction) as any);
    },
    [field.dispatch, field.setChanging],
  );

  const removeLastItem = useCallback(() => {
    field.setChanging(true);
    field.dispatch(({
      type: ArrayFieldActionEnum.REMOVE_LAST_VALUE,
      name: '',
    } as RemoveLastValueAction) as any);
  }, [field.dispatch, field.setChanging]);

  const setItem = useCallback(
    (index: number | string, value: any) => {
      field.setChanging(true);
      field.dispatch(({
        type: ArrayFieldActionEnum.SET_VALUE_AT_INDEX,
        name: '',
        index: Number(index),
        value,
      } as SetValueAtIndexAction) as any);
    },
    [field.dispatch, field.setChanging],
  );

  return {
    ...field,
    addItem,
    removeItem,
    removeLastItem,
    setItem,
    Provider: FormFieldContext.Provider,
    getError,
    getInitialItem,
    getItem,
    kind: 'ARRAY',
  };
}
