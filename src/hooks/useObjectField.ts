import { useCallback } from 'react';
import { FormFieldContext } from './formContext';
import useField, { IField as IScalarField, IFieldSettings, IFieldState } from './useField';

type GetErrorFn = (field: number | string) => void | string;
type GetFieldFn = (field: number | string) => any;
type SetFieldFn = (field: number | string, value: any) => void;

export type Field = IScalarField<undefined | { [key: string]: string } | string> & {
  kind: 'OBJECT';
  getError: GetErrorFn;
  getField: GetFieldFn;
  getInitialField: GetFieldFn;
  setField: SetFieldFn;
};

interface IFieldComponents {
  Provider: typeof FormFieldContext['Provider'];
}

export default function useObjectField(
  currentValue?: { [key: string]: any },
  initialValue?: { [key: string]: any },
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
  const getField = useCallback(fieldName => (field.value ? field.value[fieldName] : undefined), [
    field.value,
  ]);
  const getInitialField = useCallback(
    fieldName => (field.initialValue ? field.initialValue[fieldName] : undefined),
    [field.initialValue],
  );
  const setField = useCallback(
    (fieldName, newValue) =>
      field.setValue(({ value }: IFieldState) => ({ ...value, [fieldName]: newValue })),
    [field.setValue],
  );

  return {
    ...field,
    Provider: FormFieldContext.Provider,
    getError,
    getField,
    getInitialField,
    kind: 'OBJECT',
    setField,
  };
}
