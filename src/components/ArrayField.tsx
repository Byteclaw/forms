import React, { ReactNode } from 'react';
import { connectToParentField } from '../hooks/connectToParentField';
import { useArrayField, ArrayFieldAPI } from '../hooks/useArrayField';
import { useParentField } from '../hooks/useParentField';
import { ArrayFieldAction } from '../hooks/arrayFieldReducer';

export type ArrayFieldRenderer<TValue extends any[]> = (
  field: ArrayFieldAPI<TValue, ArrayFieldAction>,
) => ReactNode;

interface IProps<TValue extends any[]> {
  children: ArrayFieldRenderer<TValue> | ReactNode;
  debounceDelay?: number;
  name: number | string;
}

export function ArrayField<TValue extends any[] = any[]>({
  children,
  debounceDelay,
  name,
}: IProps<TValue>) {
  const parentField = useParentField();
  const field = connectToParentField(name, parentField, useArrayField, {
    debounceDelay,
  });

  return (
    <field.Provider value={field}>
      {typeof children === 'function' ? (children as ArrayFieldRenderer<any[]>)(field) : children}
    </field.Provider>
  );
}
