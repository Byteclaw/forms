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
import { ArrayFieldAction, ArrayFieldState } from '../reducers';
import { CompositeFieldContext, useArrayField } from '../hooks';

export interface ArrayFieldRenderer<TValue extends any[]> {
  (
    state: ArrayFieldState<TValue>,
    dispatch: Dispatch<ArrayFieldAction<TValue>>,
  ): ReactElement | null;
}

export interface ArrayFieldProps<TValue extends any[]> {
  children?: ArrayFieldRenderer<TValue> | ReactNode;
  name: string | number;
  removeOnUnmount?: boolean;
}

interface ArrayFieldComponent {
  <TValue extends any[] = any[]>(props: ArrayFieldProps<TValue>): ReactElement | null;
  <TValue extends any[] = any[], TAs extends keyof JSX.IntrinsicElements = any>(
    props: { as: TAs } & JSX.IntrinsicElements[TAs] & ArrayFieldProps<TValue>,
  ): ReactElement | null;
  <TValue extends any[] = any[], TAs extends ComponentType<any> = FC<{}>>(
    props: { as: TAs } & ComponentProps<TAs> & ArrayFieldProps<TValue>,
  ): ReactElement | null;
  displayName?: string;
}

export const ArrayField: ArrayFieldComponent = forwardRef(
  (
    {
      as: As = Fragment,
      children,
      name,
      removeOnUnmount,
      ...restProps
    }: ArrayFieldProps<any[]> & { as: any },
    ref,
  ) => {
    const state = useArrayField<any[]>(name, removeOnUnmount);

    return (
      <CompositeFieldContext.Provider value={state}>
        <As ref={ref} {...restProps}>
          {typeof children === 'function' ? children(state[0], state[1]) : children}
        </As>
      </CompositeFieldContext.Provider>
    );
  },
) as any;

ArrayField.displayName = 'ArrayField';
