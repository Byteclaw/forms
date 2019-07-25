import { useArrayField, ArrayFieldAPI } from './useArrayField';
import { useField, IField as ScalarField, IFieldSettings } from './useField';
import { useObjectField, ObjectFieldAPI } from './useObjectField';
import { FormAPI as Form } from './useForm';

import { ArrayFieldAction } from './arrayFieldReducer';
import { ObjectFieldAction } from './objectFieldReducer';

export function connectToParentField(
  name: string | number,
  parentField: ArrayFieldAPI<ArrayFieldAction> | ObjectFieldAPI<ObjectFieldAction> | Form,
  fieldHook: typeof useArrayField,
  settings?: IFieldSettings,
): ArrayFieldAPI<ArrayFieldAction>;
export function connectToParentField(
  name: string | number,
  parentField: ArrayFieldAPI<ArrayFieldAction> | ObjectFieldAPI<ObjectFieldAction> | Form,
  fieldHook: typeof useObjectField,
  settings?: IFieldSettings,
): ObjectFieldAPI<ObjectFieldAction>;
export function connectToParentField(
  name: string | number,
  parentField: ArrayFieldAPI<ArrayFieldAction> | ObjectFieldAPI<ObjectFieldAction> | Form,
  fieldHook: typeof useField,
  settings?: IFieldSettings,
): ScalarField;

export function connectToParentField<R>(
  name: string | number,
  parentField: ArrayFieldAPI<ArrayFieldAction> | ObjectFieldAPI<ObjectFieldAction>,
  fieldHook: (currentValue?: any, initialValue?: any, errors?: any, settings?: IFieldSettings) => R,
  settings?: IFieldSettings,
): R {
  let initialValue;
  let currentValue;
  let onChange;

  if (parentField.kind === 'OBJECT') {
    initialValue = parentField.getInitialField(name);
    currentValue = parentField.getField(name);
    onChange = (value: any) => parentField.setField(name, value);
  } else {
    initialValue = parentField.getInitialItem(name);
    currentValue = parentField.getItem(name);
    onChange = (value: any) => parentField.setItem(name, value);
  }

  return fieldHook(currentValue, initialValue, parentField.getError(name), {
    ...settings,
    // bubble enableReinitialize down the tree
    enableReinitialize: parentField.enableReinitialize,
    // force propagation of childrens' values back to parentField
    parentInitialValue: parentField.initialValue,
    onChange,
    onChangingChange: (changing: boolean) => parentField.setChanging(changing, name),
    onDirtyChange: (dirty: boolean) => parentField.setDirty(dirty, name),
    onFocusChange: (focused: boolean) => parentField.setFocused(focused, name),
  });
}
