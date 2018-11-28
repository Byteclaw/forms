import { ReactText } from 'react';
import { Field as ArrayField } from './useArrayField';
import { IFieldSettings } from './useField';
import { Field as ObjectField } from './useObjectField';

export default function connectToParentField<R>(
  name: ReactText | string | number,
  parentField: ArrayField | ObjectField,
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
    onChange,
    onChangingChange: (changing: boolean) => parentField.setChanging(changing, name),
    onDirtyChange: (dirty: boolean) => parentField.setDirty(dirty, name),
    onFocusChange: (focused: boolean) => parentField.setFocused(focused, name),
  });
}
