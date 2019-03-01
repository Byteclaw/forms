import { Field as ArrayField } from './useArrayField';
import useField, { IField as ScalarField, IFieldSettings } from './useField';
import { Field as ObjectField } from './useObjectField';
import { Form } from './useForm';
import useArrayField from './useArrayField';
import useObjectField from './useObjectField';
import { ArrayFieldAction } from './arrayFieldReducer';
import { ObjectFieldAction } from './objectFieldReducer';

export default function connectToParentField(
  name: string | number,
  parentField: ArrayField<ArrayFieldAction> | ObjectField<ObjectFieldAction> | Form,
  fieldHook: typeof useArrayField,
  settings?: IFieldSettings,
): ArrayField<ArrayFieldAction>;
export default function connectToParentField(
  name: string | number,
  parentField: ArrayField<ArrayFieldAction> | ObjectField<ObjectFieldAction> | Form,
  fieldHook: typeof useObjectField,
  settings?: IFieldSettings,
): ObjectField<ObjectFieldAction>;
export default function connectToParentField(
  name: string | number,
  parentField: ArrayField<ArrayFieldAction> | ObjectField<ObjectFieldAction> | Form,
  fieldHook: typeof useField,
  settings?: IFieldSettings,
): ScalarField;

export default function connectToParentField<R>(
  name: string | number,
  parentField: ArrayField<ArrayFieldAction> | ObjectField<ObjectFieldAction>,
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
