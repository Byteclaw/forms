import React, {
  createElement,
  ComponentProps,
  FC,
  FormEventHandler,
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
  ComponentType,
  Dispatch,
} from 'react';
import { CompositeFieldContext, FormAction, FormState, FormStateContext, useForm } from '../hooks';

export interface FormRenderer<TValue extends { [key: string]: any }> {
  (formState: FormState<TValue>, formDispatch: Dispatch<FormAction<TValue>>): ReactElement | null;
}

export interface FormProps<TValue extends { [key: string]: any }> {
  children: FormRenderer<TValue> | ReactNode;
  initialValue?: TValue;
  onSubmit?: (values: TValue) => Promise<void>;
  onValidate?: (values: TValue) => Promise<void>;
  validateOnChange?: boolean;
}

interface FormComponent {
  <TValue extends { [key: string]: any } = { [key: string]: any }>(
    props: JSX.IntrinsicElements['form'] & FormProps<TValue>,
  ): ReactElement | null;
  <
    TValue extends { [key: string]: any } = { [key: string]: any },
    TAs extends keyof JSX.IntrinsicElements = any
  >(
    props: { as: TAs } & JSX.IntrinsicElements[TAs] & FormProps<TValue>,
  ): ReactElement | null;
  <
    TValue extends { [key: string]: any } = { [key: string]: any },
    TAs extends ComponentType<any> = FC<{}>
  >(
    props: { as: TAs } & ComponentProps<TAs> & FormProps<TValue>,
  ): ReactElement | null;
  displayName?: string;
}

export const Form: FormComponent = function Form({
  as = 'form',
  children,
  initialValue,
  onSubmit,
  onValidate,
  validateOnChange,
  ...restProps
}: FormProps<{ [key: string]: any }> & { as: keyof JSX.IntrinsicElements; [key: string]: any }) {
  const [formState, formDispatch] = useForm<{
    [key: string]: any;
  }>(initialValue, onSubmit, onValidate, validateOnChange);
  const formStateValue: [typeof formState, typeof formDispatch] = useMemo(
    () => [formState, formDispatch],
    [formState],
  );
  const handleSubmit: FormEventHandler = useCallback(e => {
    e.preventDefault();
    formDispatch({ type: 'SUBMIT' });
  }, []);

  return (
    <FormStateContext.Provider value={formStateValue}>
      <CompositeFieldContext.Provider value={formStateValue}>
        {typeof children === 'function'
          ? children(formState, formDispatch)
          : createElement(as, {
              onSubmit: handleSubmit,
              children,
              ...restProps,
            })}
      </CompositeFieldContext.Provider>
    </FormStateContext.Provider>
  );
} as any;
