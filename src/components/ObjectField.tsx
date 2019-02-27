import React, { ReactNode, ReactNodeArray } from 'react';
import connectToParentField from '../hooks/connectToParentField';
import useObjectField, { Field } from '../hooks/useObjectField';
import useParentField from '../hooks/useParentField';
import { ObjectFieldAction } from '../hooks/objectFieldReducer';

type ObjectFieldRenderer = (field: Field<ObjectFieldAction>) => ReactNode;

interface IProps {
  children: ObjectFieldRenderer | ReactNode | ReactNodeArray;
  debounceDelay?: number;
  name: number | string;
}

export default function ObjectField({ children, debounceDelay, name }: IProps) {
  const parentField = useParentField();
  const field = connectToParentField(name, parentField, useObjectField, {
    debounceDelay,
  });

  return (
    <field.Provider value={field}>
      {typeof children === 'function' ? (children as ObjectFieldRenderer)(field) : children}
    </field.Provider>
  );
}
