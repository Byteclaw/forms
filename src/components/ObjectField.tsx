import React, {
  ComponentProps,
  ComponentType,
  Dispatch,
  FC,
  Fragment,
  ReactElement,
  ReactNode,
  forwardRef,
} from 'react';
import { ObjectFieldState, ObjectFieldAction } from '../reducers';
import { CompositeFieldContext, useObjectField } from '../hooks';

export interface ObjectFieldRenderer<TValue extends { [key: string]: any }> {
  (
    state: ObjectFieldState<TValue>,
    dispatch: Dispatch<ObjectFieldAction<TValue>>,
  ): ReactElement | null;
}

export interface ObjectFieldProps<TValue extends { [key: string]: any }> {
  children?: ObjectFieldRenderer<TValue> | ReactNode;
  name: string;
  removeOnUnmount?: boolean;
}

interface ObjectFieldComponent {
  <TValue extends { [key: string]: any } = { [key: string]: any }>(
    props: ObjectFieldProps<TValue>,
  ): ReactElement | null;
  <
    TValue extends { [key: string]: any } = { [key: string]: any },
    TAs extends keyof JSX.IntrinsicElements = any
  >(
    props: { as: TAs } & JSX.IntrinsicElements[TAs] & ObjectFieldProps<TValue>,
  ): ReactElement | null;
  <
    TValue extends { [key: string]: any } = { [key: string]: any },
    TAs extends ComponentType<any> = FC<{}>
  >(
    props: { as: TAs } & ComponentProps<TAs> & ObjectFieldProps<TValue>,
  ): ReactElement | null;
  displayName?: string;
}

export const ObjectField: ObjectFieldComponent = forwardRef(
  (
    {
      as: As = Fragment,
      children,
      name,
      removeOnUnmount,
      ...restProps
    }: ObjectFieldProps<{ [key: string]: any }> & { as: any },
    ref,
  ) => {
    const state = useObjectField<{ [key: string]: any }>(name, removeOnUnmount);

    return (
      <CompositeFieldContext.Provider value={state}>
        <As ref={ref} {...restProps}>
          {typeof children === 'function' ? children(state[0], state[1]) : children}
        </As>
      </CompositeFieldContext.Provider>
    );
  },
) as any;

ObjectField.displayName = 'ObjectField';
