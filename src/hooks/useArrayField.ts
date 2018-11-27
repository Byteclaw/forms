import { useCallback } from 'react';
import { FormFieldContext } from './formContext';
import useField, { IField as IScalarField, IFieldSettings, IFieldState } from './useField';

type AddItemFn = (value: any) => void;
type GetErrorFn = (field: string | number) => void | string;
type GetItemFn = (index: number | string) => any;
type RemoveLastItemFn = () => void;
type RemoveItemFn = (index: number) => void;
type SetItemFn = (index: number | string, value: any) => void;

export type Field = IScalarField<undefined | { [key: string]: string } | string> & {
  addItem: AddItemFn;
  getError: GetErrorFn;
  getInitialItem: GetItemFn;
  getItem: GetItemFn;
  kind: 'ARRAY';
  removeItem: RemoveItemFn;
  removeLastItem: RemoveLastItemFn;
  setItem: SetItemFn;
};

interface IFieldComponents {
  Provider: typeof FormFieldContext['Provider'];
}

export default function useArrayField(
  currentValue?: any[],
  initialValue?: any[],
  errors?: { [key: string]: string } | string,
  settings?: IFieldSettings,
): Field & IFieldComponents {
  const field = useField(currentValue, initialValue, errors, {
    enableReinitialize: false,
    ...settings,
  });
  const getError = useCallback(
    fieldName => {
      if (field.error == null || typeof field.error === 'string') {
        return undefined;
      }

      return field.error[fieldName];
    },
    [field.error],
  );
  const getItem = useCallback(fieldName => (field.value ? field.value[fieldName] : undefined), [
    field.value,
  ]);
  const getInitialItem = useCallback(
    fieldName => (field.initialValue ? field.initialValue[fieldName] : undefined),
    [field.initialValue],
  );
  const addItem = useCallback(
    (newValue: any) =>
      field.setValue(({ value }: IFieldState) => {
        if (value == null) {
          return [newValue];
        }

        return [...value, newValue];
      }),
    [field.setValue],
  );
  const removeItem = useCallback(
    (index: number) =>
      field.setValue(({ value }: IFieldState) => [
        ...value.slice(0, index),
        ...value.slice(index + 1),
      ]),
    [field.setValue],
  );
  const removeLastItem = useCallback(
    () => {
      field.setValue(({ value }: IFieldState) => value.slice(0, -1));
    },
    [field.setValue],
  );
  const setItem = useCallback(
    (fieldName, newValue) =>
      field.setValue(({ value }: IFieldState) => {
        const clonedValue = (value || []).slice();
        clonedValue[fieldName] = newValue;

        return clonedValue;
      }),
    [field.setValue],
  );

  return {
    ...field,
    Provider: FormFieldContext.Provider,
    addItem,
    getError,
    getInitialItem,
    getItem,
    kind: 'ARRAY',
    removeItem,
    removeLastItem,
    setItem,
  };
}
