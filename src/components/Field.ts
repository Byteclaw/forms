import {
  ChangeEventHandler,
  ComponentProps,
  ComponentType,
  createElement,
  Dispatch,
  FC,
  FocusEventHandler,
  ReactElement,
  ReactNode,
  forwardRef,
  useCallback,
} from 'react';
import { useField, FieldState, FieldAction } from '../hooks';

export interface FieldRenderer<TValue> {
  (state: FieldState<TValue>, dispatch: Dispatch<FieldAction<TValue>>): ReactElement | null;
}

export interface FieldProps<TValue> {
  children?: FieldRenderer<TValue> | ReactNode;
  /**
   * Debounce delay, by default 300ms
   */
  debounceDelay?: number;
  name: string;
  removeOnUnmount?: boolean;
}

interface FieldComponent {
  <TValue = any>(props: JSX.IntrinsicElements['input'] & FieldProps<TValue>): ReactElement | null;
  <TValue = any, TAs extends keyof JSX.IntrinsicElements = any>(
    props: { as: TAs } & JSX.IntrinsicElements[TAs] & FieldProps<TValue>,
  ): ReactElement | null;
  <TValue = any, TAs extends ComponentType<any> = FC<{}>>(
    props: { as: TAs } & ComponentProps<TAs> & FieldProps<TValue>,
  ): ReactElement | null;
  displayName?: string;
}

export const Field: FieldComponent = forwardRef(
  (
    {
      as = 'input',
      children,
      debounceDelay,
      name,
      removeOnUnmount,
      ...restProps
    }: FieldProps<any> & { as: keyof JSX.IntrinsicElements },
    ref,
  ) => {
    const [fieldState, fieldDispatch] = useField<any>(name, debounceDelay, removeOnUnmount);
    const onBlur: FocusEventHandler = useCallback(() => fieldDispatch({ type: 'BLUR' }), [
      fieldDispatch,
    ]);
    const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
      e => fieldDispatch({ type: 'CHANGE', value: e.currentTarget.value }),
      [fieldDispatch],
    );
    const onFocus: FocusEventHandler = useCallback(() => fieldDispatch({ type: 'FOCUS' }), [
      fieldDispatch,
    ]);

    if (typeof children === 'function') {
      return children(fieldState, fieldDispatch);
    }

    return createElement(as, {
      ...restProps,
      'aria-invalid': !fieldState.valid,
      name,
      onBlur,
      onChange,
      onFocus,
      ref,
      value: fieldState.value,
    });
  },
) as any;

Field.displayName = 'Field';
