// @flow

import React, { type Node } from 'react';
import connectToParentField from '../hooks/connectToParentField';
import useParentField from '../hooks/useParentField';
import useObjectField, { type Field } from '../hooks/useObjectField';

type ObjectFieldRenderer = (field: Field) => Node;

type Props = {
  debounceDelay?: number,
  children: ObjectFieldRenderer | Node,
  name: number | string,
};

export default function ObjectField({ debounceDelay, children, name }: Props) {
  const parentField = useParentField();
  const field = connectToParentField(name, parentField, useObjectField, { debounceDelay });

  return (
    <field.Provider value={field}>
      {typeof children === 'function' ? children(field) : children}
    </field.Provider>
  );
}
