// @flow

// $FlowFixMe
import { useCallback } from 'react';
import { FormFieldContext } from './formContext';
import useField, {
  type Field as ScalarField,
  type FieldSettings,
  type FieldState,
} from './useField';

type AddItemFn = (value: any) => void;
type GetErrorFn = (field: string | number) => ?string;
type GetItemFn = (index: number | string) => any;
type RemoveLastItemFn = () => void;
type RemoveItemFn = (index: number) => void;
type SetItemFn = (index: number | string, value: any) => void;

export type Field = ScalarField<{ [key: number | string]: string } | string> & {
  addItem: AddItemFn,
  getError: GetErrorFn,
  getInitialItem: GetItemFn,
  getItem: GetItemFn,
  kind: 'ARRAY',
  removeItem: RemoveItemFn,
  removeLastItem: RemoveLastItemFn,
  setItem: SetItemFn,
};

type FieldComponents = { Provider: $PropertyType<typeof FormFieldContext, 'Provider'> };

export default function useArrayField(
  currentValue?: Array<any>,
  initialValue?: Array<any>,
  errors?: { [key: string | number]: string } | string,
  settings?: FieldSettings,
): Field & FieldComponents {
  const field = useField(currentValue, initialValue, errors, {
    enableReinitialize: false,
    ...settings,
  });
  const getError: GetErrorFn = useCallback(
    fieldName => {
      if (field.error == null || typeof field.error === 'string') {
        return undefined;
      }

      return field.error[fieldName];
    },
    [field.error],
  );
  const getItem: GetItemFn = useCallback(
    fieldName => (field.value ? field.value[fieldName] : undefined),
    [field.value],
  );
  const getInitialItem: GetItemFn = useCallback(
    fieldName => (field.initialValue ? field.initialValue[fieldName] : undefined),
    [field.initialValue],
  );
  const addItem: AddItemFn = useCallback(
    (newValue: any) =>
      field.setValue(({ value }: FieldState) => {
        if (value == null) {
          return [newValue];
        }

        return [...value, newValue];
      }),
    [field.setValue],
  );
  const removeItem: RemoveItemFn = useCallback(
    (index: number) =>
      field.setValue(({ value }: FieldState) => [
        ...value.slice(0, index),
        ...value.slice(index + 1),
      ]),
    [field.setValue],
  );
  const removeLastItem: RemoveLastItemFn = useCallback(
    () => {
      field.setValue(({ value }: FieldState) => value.slice(0, -1));
    },
    [field.setValue],
  );
  const setItem: SetItemFn = useCallback(
    (fieldName, newValue) =>
      field.setValue(({ value }: FieldState) => {
        const clonedValue = (value || []).slice();
        clonedValue[fieldName] = newValue;

        return clonedValue;
      }),
    [field.setValue],
  );

  return {
    ...field,
    addItem,
    kind: 'ARRAY',
    getError,
    getInitialItem,
    getItem,
    removeItem,
    removeLastItem,
    setItem,
    Provider: FormFieldContext.Provider,
  };
}
