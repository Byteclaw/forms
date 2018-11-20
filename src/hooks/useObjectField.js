// @flow

// $FlowFixMe
import { useCallback } from 'react';
import { FormFieldContext } from './formContext';
import useField, {
  type Field as ScalarField,
  type FieldSettings,
  type FieldState,
} from './useField';

type GetErrorFn = (field: number | string) => ?string;
type GetFieldFn = (field: number | string) => any;
type SetFieldFn = (field: number | string, value: any) => void;

export type Field = ScalarField<{ [key: string | number]: string } | string> & {
  kind: 'OBJECT',
  getError: GetErrorFn,
  getField: GetFieldFn,
  getInitialField: GetFieldFn,
  setField: SetFieldFn,
};

type FieldComponents = { Provider: $PropertyType<typeof FormFieldContext, 'Provider'> };

export default function useObjectField(
  currentValue?: { [key: string]: any },
  initialValue?: { [key: string]: any },
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
  const getField: GetFieldFn = useCallback(
    fieldName => (field.value ? field.value[fieldName] : undefined),
    [field.value],
  );
  const getInitialField: GetFieldFn = useCallback(
    fieldName => (field.initialValue ? field.initialValue[fieldName] : undefined),
    [field.initialValue],
  );
  const setField: SetFieldFn = useCallback(
    (fieldName, newValue) =>
      field.setValue(({ value }: FieldState) => ({ ...value, [fieldName]: newValue })),
    [field.setValue],
  );

  return {
    ...field,
    kind: 'OBJECT',
    getError,
    getField,
    getInitialField,
    setField,
    Provider: FormFieldContext.Provider,
  };
}
