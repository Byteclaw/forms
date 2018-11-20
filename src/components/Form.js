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
  validationSchema: any,
};

export default function Form({
  as,
  children,
  initialValues,
  onSubmit,
  validationSchema,
  ...rest
}: Props) {
  const form = useForm(initialValues, onSubmit, validationSchema);
  const As = as;

  if (typeof children === 'function') {
    return <form.Provider value={form}>{children(form)}</form.Provider>;
  }

  return (
    <form.Provider value={form}>
      <As onSubmit={form.handleSubmit} {...rest}>
        {children}
      </As>
    </form.Provider>
  );
}

Form.defaultProps = {
  as: 'form',
  initialValues: {},
  onSubmit: () => {},
  validationSchema: yup.object(),
};
