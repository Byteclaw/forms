import React, { ReactNode, ReactNodeArray } from 'react';
import connectToParentField from '../hooks/connectToParentField';
import useObjectField, { Field } from '../hooks/useObjectField';
import useParentField from '../hooks/useParentField';
import { ObjectFieldAction } from '../hooks/objectFieldReducer';

export type ObjectFieldAPI = Field<ObjectFieldAction>;

export type ObjectFieldRenderer = (field: ObjectFieldAPI) => ReactNode;

interface IProps {
  children: ObjectFieldRenderer | ReactNode | ReactNodeArray;
  debounceDelay?: number;
  name: number | string;
}

export function ObjectField({ children, debounceDelay, name }: IProps) {
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

export default ObjectField;
