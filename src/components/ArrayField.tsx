import React, { ReactNode, ReactNodeArray } from 'react';
import connectToParentField from '../hooks/connectToParentField';
import useArrayField, { Field } from '../hooks/useArrayField';
import useParentField from '../hooks/useParentField';

type ArrayFieldRenderer = (field: Field) => ReactNode;

interface IProps {
  children: ArrayFieldRenderer | ReactNode | ReactNodeArray;
  debounceDelay?: number;
  name: number | string;
}

export default function ArrayField({ children, debounceDelay, name }: IProps) {
  const parentField = useParentField();
  const field = connectToParentField(name, parentField, useArrayField, {
    debounceDelay,
  });

  return (
    <field.Provider value={field}>
      {typeof children === 'function' ? (children as ArrayFieldRenderer)(field) : children}
    </field.Provider>
  );
}
