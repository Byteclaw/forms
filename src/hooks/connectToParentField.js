// @flow

import { type FieldSettings } from './useField';
import { type Field as ArrayField } from './useArrayField';
import { type Field as ObjectField } from './useObjectField';

export default function connectToParentField<R>(
  name: string | number,
  parentField: ArrayField | ObjectField,
  fieldHook: (currentValue?: any, initialValue?: any, errors?: *, settings?: FieldSettings) => R,
  settings?: FieldSettings,
): R {
  let initialValue;
  let currentValue;
  let onChange;

  if (parentField.kind === 'OBJECT') {
    initialValue = parentField.getInitialField(name);
    currentValue = parentField.getField(name);
    // $FlowFixMe
    onChange = value => parentField.setField(name, value);
  } else {
    initialValue = parentField.getInitialItem(name);
    currentValue = parentField.getItem(name);
    // $FlowFixMe
    onChange = value => parentField.setItem(name, value);
  }

  return fieldHook(currentValue, initialValue, parentField.getError(name), {
    ...settings,
    onDirtyChange: dirty => parentField.setDirty(dirty, name),
    onChange,
    onChangingChange: changing => parentField.setChanging(changing, name),
    onFocusChange: focused => parentField.setFocused(focused, name),
  });
}
