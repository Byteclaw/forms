import React, { ComponentProps, ComponentType, FC, ReactElement, ReactNode } from 'react';
import * as yup from 'yup';
import { useForm, FormAPI } from '../hooks/useForm';

type OnSubmitFn<TValue extends { [key: string]: any }> = (values: TValue) => Promise<any>;

type FormRenderer<TValue extends { [key: string]: any }> = (
  form: FormAPI<TValue>,
) => ReactElement | null;

interface IProps<TValue extends { [key: string]: any }> {
  as?: string | ComponentType<any>;
  children: FormRenderer<TValue> | ReactNode;
  enableReinitialize?: boolean;
  initialValues?: TValue;
  onSubmit?: OnSubmitFn<TValue>;
  validateOnChange?: boolean;
  validationSchema?: any;
}

interface FormComponent {
  <TValue extends { [key: string]: any } = { [key: string]: any }>(
    props: JSX.IntrinsicElements['form'] & IProps<TValue>,
  ): ReactElement | null;
  <
    TValue extends { [key: string]: any } = { [key: string]: any },
    TAs extends keyof JSX.IntrinsicElements = any
  >(
    props: { as: TAs } & JSX.IntrinsicElements[TAs] & IProps<TValue>,
  ): ReactElement | null;
  <
    TValue extends { [key: string]: any } = { [key: string]: any },
    TAs extends ComponentType<any> = FC<{}>
  >(
    props: { as: TAs } & ComponentProps<TAs> & IProps<TValue>,
  ): ReactElement | null;
  displayName?: string;
}

const defaults = {
  as: 'form',
  enableReinitialize: false,
  initialValue: {},
  onSubmit: async () => undefined,
  validateOnChange: false,
  validationSchema: yup.object(),
};

export const Form: FormComponent = function Form<
  TValue extends { [key: string]: any } = { [key: string]: any }
>({
  as: As = defaults.as,
  children,
  enableReinitialize = defaults.enableReinitialize,
  initialValues = defaults.initialValue as TValue,
  onSubmit = defaults.onSubmit,
  validateOnChange = defaults.validateOnChange,
  validationSchema = defaults.validationSchema,
  ...rest
}: IProps<TValue>) {
  const form = useForm(
    initialValues,
    onSubmit,
    validationSchema,
    validateOnChange,
    enableReinitialize,
  );

  return (
    <form.FormProvider value={form}>
      <form.FieldProvider value={form}>
        {typeof children === 'function' ? (
          (children as FormRenderer<any>)(form)
        ) : (
          <As onSubmit={form.handleSubmit} {...rest}>
            {children}
          </As>
        )}
      </form.FieldProvider>
    </form.FormProvider>
  );
};
