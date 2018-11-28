import React, { ComponentType, createElement, ReactNode, ReactNodeArray } from 'react';
import * as yup from 'yup';
import useForm, { Form as FormAPI } from '../hooks/useForm';

type OnSubmitFn = (values: any) => Promise<any>;

type FormRenderer = (form: FormAPI) => ReactNode;

interface IProps {
  as?: string | ComponentType<any>;
  children: FormRenderer | ReactNode | ReactNodeArray;
  initialValues?: object;
  onSubmit?: OnSubmitFn;
  validateOnChange?: boolean;
  validationSchema?: any;
}

const defaults = {
  as: 'form',
  initialValue: {},
  onSubmit: async () => undefined,
  validateOnChange: false,
  validationSchema: yup.object(),
};

export default function Form({
  as: As = defaults.as,
  children,
  initialValues = defaults.initialValue,
  onSubmit = defaults.onSubmit,
  validateOnChange = defaults.validateOnChange,
  validationSchema = defaults.validationSchema,
  ...rest
}: IProps) {
  const form = useForm(initialValues, onSubmit, validationSchema, validateOnChange);

  return (
    <form.FormProvider value={form}>
      <form.FieldProvider value={form}>
        {typeof children === 'function' ? (
          (children as FormRenderer)(form)
        ) : (
          <As onSubmit={form.handleSubmit} {...rest}>
            {children}
          </As>
        )}
      </form.FieldProvider>
    </form.FormProvider>
  );
}
