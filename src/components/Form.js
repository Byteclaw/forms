// @flow
/* eslint-disable no-nested-ternary */

import React, { type ComponentType, type Node } from 'react';
import * as yup from 'yup';
import useForm, { type Form as FormAPI } from '../hooks/useForm';

type OnSubmitFn = (values: any) => Promise<any>;

type FormRenderer = (form: FormAPI) => Node;

type Props = {
  as: string | ComponentType<any>,
  children: ?(FormRenderer | Node),
  initialValues: Object,
  onSubmit: OnSubmitFn,
  validateOnChange?: boolean,
  validationSchema: any,
};

export default function Form({
  as: As,
  children,
  initialValues,
  onSubmit,
  validateOnChange,
  validationSchema,
  ...rest
}: Props) {
  const form = useForm(initialValues, onSubmit, validationSchema, validateOnChange);

  return (
    <form.FormProvider value={form}>
      <form.FieldProvider value={form}>
        {typeof children === 'function' ? (
          children(form)
        ) : (
          <As onSubmit={form.handleSubmit} {...rest}>
            {children}
          </As>
        )}
      </form.FieldProvider>
    </form.FormProvider>
  );
}

Form.defaultProps = {
  as: 'form',
  initialValues: {},
  onSubmit: () => {},
  validationSchema: yup.object(),
};
