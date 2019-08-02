import React, { ReactElement, ReactNode } from 'react';
import { connectToParentField } from '../hooks/connectToParentField';
import { useObjectField, ObjectFieldAPI } from '../hooks/useObjectField';
import { useParentField } from '../hooks/useParentField';
import { ObjectFieldAction } from '../hooks/objectFieldReducer';

export type ObjectFieldRenderer<TValue extends { [key: string]: any }> = (
  field: ObjectFieldAPI<TValue, ObjectFieldAction>,
) => ReactElement | null;

interface IProps<TValue extends { [key: string]: any }> {
  children: ObjectFieldRenderer<TValue> | ReactNode;
  debounceDelay?: number;
  name: number | string;
}

export function ObjectField<TValue extends { [key: string]: any } = { [key: string]: any }>({
  children,
  debounceDelay,
  name,
}: IProps<TValue>) {
  const parentField = useParentField();
  const field = connectToParentField(name, parentField, useObjectField, {
    debounceDelay,
  });

  return (
    <field.Provider value={field}>
      {typeof children === 'function' ? (children as ObjectFieldRenderer<any>)(field) : children}
    </field.Provider>
  );
}
