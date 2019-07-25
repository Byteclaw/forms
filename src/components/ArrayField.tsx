import React, { ReactNode, ReactNodeArray } from 'react';
import { connectToParentField } from '../hooks/connectToParentField';
import { useArrayField, ArrayFieldAPI } from '../hooks/useArrayField';
import { useParentField } from '../hooks/useParentField';
import { ArrayFieldAction } from '../hooks/arrayFieldReducer';

// export type ArrayFieldAPI = Field<ArrayFieldAction>;

export type ArrayFieldRenderer = (field: ArrayFieldAPI<ArrayFieldAction>) => ReactNode;

interface IProps {
  children: ArrayFieldRenderer | ReactNode | ReactNodeArray;
  debounceDelay?: number;
  name: number | string;
}

export function ArrayField({ children, debounceDelay, name }: IProps) {
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
