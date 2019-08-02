import {
  FC,
  ComponentProps,
  ComponentType,
  createElement,
  forwardRef,
  ReactElement,
  ReactNode,
  SyntheticEvent,
} from 'react';
import { connectToParentField } from '../hooks/connectToParentField';
import { useField, IField as FieldAPI } from '../hooks/useField';
import { useParentField } from '../hooks/useParentField';

export type FieldRenderFn<TValue> = (field: FieldAPI<TValue>) => ReactElement | null;

export { FieldAPI };

interface IProps<TValue> {
  debounceDelay?: number;
  children?: void | ReactNode | FieldRenderFn<TValue>;
  name: string | number;
}

interface FieldComponent {
  <TValue = any>(props: JSX.IntrinsicElements['input'] & IProps<TValue>): ReactElement | null;
  <TValue = any, TAs extends keyof JSX.IntrinsicElements = any>(
    props: { as: TAs } & JSX.IntrinsicElements[TAs] & IProps<TValue>,
  ): ReactElement | null;
  <TValue = any, TAs extends ComponentType<any> = FC<{}>>(
    props: { as: TAs } & ComponentProps<TAs> & IProps<TValue>,
  ): ReactElement | null;
  displayName?: string;
}

export const Field: FieldComponent = forwardRef(
  (
    {
      as = 'input',
      children = null,
      debounceDelay = 300,
      name,
      ...rest
    }: IProps<any> & { as: any },
    ref,
  ) => {
    const parentField = useParentField();
    const field = connectToParentField(name, parentField, useField, {
      debounceDelay,
    });

    if (typeof children === 'function') {
      return (children as FieldRenderFn<any>)(field) as ReactElement<any> | null;
    }

    function onBlur() {
      field.setFocused(false);
    }

    function onFocus() {
      field.setFocused(true);
    }

    function onChange(e: SyntheticEvent<HTMLInputElement>) {
      // react-native textInput (out of the box)
      // @ts-ignore
      if (e.nativeEvent && e.nativeEvent.text !== undefined) {
        // @ts-ignore
        field.setValue(e.nativeEvent.text);
      } else if (e.currentTarget != null) {
        field.setValue(e.currentTarget.value);
      }
    }

    return createElement(as, {
      ...rest,
      children,
      name,
      onBlur,
      onChange,
      onFocus,
      ref,
      value: field.value || '',
    });
  },
) as any;

Field.displayName = 'Field';
