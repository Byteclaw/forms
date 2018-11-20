// @flow

import { createElement, type ComponentType, type Node } from 'react';
import connectToParentField from '../hooks/connectToParentField';
import useField, { type Field as FieldAPI } from '../hooks/useField';
import useParentField from '../hooks/useParentField';

type FieldRenderFn = (field: FieldAPI<?string>) => Node;

type Props = {
  as: string | ComponentType<any>,
  debounceDelay: number,
  children: ?(Node | FieldRenderFn),
  name: number | string,
};

export default function Field({ as, debounceDelay, children, name, ...rest }: Props) {
  const parentField = useParentField();
  const field = connectToParentField(name, parentField, useField, { name, debounceDelay });

  if (typeof children === 'function') {
    return children(field);
  }

  function onBlur() {
    field.setFocused(false);
  }

  function onFocus() {
    field.setFocused(true);
  }

  function onChange(e: SyntheticInputEvent<HTMLInputElement>) {
    field.setValue(e.target.value);
  }

  return createElement(as, {
    name,
    children,
    ...rest,
    onBlur,
    onFocus,
    onChange,
    value: field.value,
  });
}

Field.defaultProps = {
  as: 'input',
  debounceDelay: 300,
  children: null,
};
