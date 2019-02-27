import { useCallback } from 'react';
import { FormFieldContext } from './formContext';
import useField, { IField as IScalarField, IFieldSettings } from './useField';
import {
  objectFieldReducer,
  ObjectFieldActionEnum,
  ObjectFieldAction,
  SetFieldAction,
} from './objectFieldReducer';
import { FieldState } from './fieldReducer';

type GetErrorFn = (field: number | string) => void | string;
type GetFieldFn = (field: number | string) => any;
type SetFieldFn = (field: number | string, value: any) => void;

export type Field<TActions> = IScalarField<TActions> & {
  kind: 'OBJECT';
  getError: GetErrorFn;
  getField: GetFieldFn;
  getInitialField: GetFieldFn;
  setField: SetFieldFn;
} & IFieldComponents;

interface IFieldComponents {
  Provider: typeof FormFieldContext['Provider'];
}

const defaultInitialValue = {};

export default function useObjectField<
  TFieldState extends FieldState<{ [key: string]: any }> = FieldState<{ [key: string]: any }>,
  TFieldActions = ObjectFieldAction
>(
  currentValue?: { [key: string]: any },
  initialValue: { [key: string]: any } = defaultInitialValue,
  errors?: undefined | { [key: string]: string } | string,
  settings?: IFieldSettings<TFieldState, TFieldActions>,
): TFieldState & Field<TFieldActions> {
  const field = useField<TFieldState, TFieldActions>(currentValue, initialValue, errors, {
    enableReinitialize: false,
    reducer: objectFieldReducer as any,
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
  const getField = useCallback(fieldName => (field.value ? field.value[fieldName] : undefined), [
    field.value,
  ]);
  const getInitialField = useCallback(
    fieldName => (field.initialValue ? field.initialValue[fieldName] : undefined),
    [field.initialValue],
  );
  const setField = useCallback(
    (fieldName: string, value: any) => {
      field.setChanging(true);
      field.dispatch(({
        type: ObjectFieldActionEnum.SET_FIELD,
        field: fieldName,
        name: '',
        value,
      } as SetFieldAction) as any);
    },
    [field.setChanging, field.dispatch],
  );

  return {
    ...(field as any),
    Provider: FormFieldContext.Provider,
    getError,
    getField,
    getInitialField,
    kind: 'OBJECT',
    setField,
  };
}
