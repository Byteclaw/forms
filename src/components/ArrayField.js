// @flow

import React, { type Node } from 'react';
import connectToParentField from '../hooks/connectToParentField';
import useParentField from '../hooks/useParentField';
import useArrayField, { type Field } from '../hooks/useArrayField';

type ArrayFieldRenderer = (field: Field) => Node;

type Props = {
  debounceDelay?: number,
  children: ArrayFieldRenderer | Node,
  name: number | string,
};

export default function ArrayField({ debounceDelay, children, name }: Props) {
  const parentField = useParentField();
  const field = connectToParentField(name, parentField, useArrayField, { debounceDelay });

  return (
    <field.Provider value={field}>
      {typeof children === 'function' ? children(field) : children}
    </field.Provider>
  );
}
