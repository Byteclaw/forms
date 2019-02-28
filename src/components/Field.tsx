import {
  ComponentType,
  createElement,
  forwardRef,
  ReactElement,
  ReactNode,
  ReactNodeArray,
  SyntheticEvent,
} from 'react';
import connectToParentField from '../hooks/connectToParentField';
import useField, { IField as FieldAPI } from '../hooks/useField';
import useParentField from '../hooks/useParentField';

export type FieldRenderFn = (field: FieldAPI) => ReactNode;

export { FieldAPI };

interface IProps {
  as?: string | ComponentType<any>;
  debounceDelay?: number;
  children?: void | ReactNode | ReactNodeArray | FieldRenderFn;
  name: string | number;
  [key: string]: any;
}

const Field = forwardRef(
  ({ as = 'input', children = null, debounceDelay = 300, name, ...rest }: IProps, ref) => {
    const parentField = useParentField();
    const field = connectToParentField(name, parentField, useField, {
      debounceDelay,
    });

    if (typeof children === 'function') {
      return (children as FieldRenderFn)(field) as ReactElement<any> | null;
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
);

Field.displayName = 'Field';

export default Field;
