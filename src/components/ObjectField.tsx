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

interface ObjectFieldRenderer<TValue> {
  (
    state: ObjectFieldState<TValue>,
    dispatch: Dispatch<ObjectFieldAction<TValue>>,
  ): ReactElement | null;
}

interface ObjectFieldProps<TValue> {
  children?: ObjectFieldRenderer<TValue> | ReactNode;
  name: string;
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
      ...restProps
    }: ObjectFieldProps<{ [key: string]: any }> & { as: any },
    ref,
  ) => {
    const state = useObjectField<{ [key: string]: any }>(name);

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
