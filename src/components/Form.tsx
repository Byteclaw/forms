import React, { ComponentType, ReactNode, ReactNodeArray } from 'react';
import * as yup from 'yup';
import useForm, { Form as FormAPI } from '../hooks/useForm';

type OnSubmitFn = (values: any) => Promise<any>;

type FormRenderer = (form: FormAPI) => ReactNode;

interface IProps {
  as?: string | ComponentType<any>;
  children: FormRenderer | ReactNode | ReactNodeArray;
  enableReinitialize?: boolean;
  initialValues?: object;
  onSubmit?: OnSubmitFn;
  validateOnChange?: boolean;
  validationSchema?: any;
  [extra: string]: any;
}

const defaults = {
  as: 'form',
  enableReinitialize: false,
  initialValue: {},
  onSubmit: async () => undefined,
  validateOnChange: false,
  validationSchema: yup.object(),
};

export function Form({
  as: As = defaults.as,
  children,
  enableReinitialize = defaults.enableReinitialize,
  initialValues = defaults.initialValue,
  onSubmit = defaults.onSubmit,
  validateOnChange = defaults.validateOnChange,
  validationSchema = defaults.validationSchema,
  ...rest
}: IProps) {
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

export default Form;
