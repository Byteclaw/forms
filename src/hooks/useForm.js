// @flow

import * as yup from 'yup';
// $FlowFixMe
import { useState } from 'react';
import convertValidationErrors from '../utils/convertValidationErrors';
import useObjectField, { type Field } from './useObjectField';
import { FormFieldContext, FormContext } from './formContext';

export type FormState = {
  errors: { [key: string]: string },
  submitting: boolean,
  valid: boolean,
  validating: boolean,
};

type FormAPI = {
  handleSubmit: (value: { [key: string]: any }) => Promise<any>,
};

type FormComponents = {
  FieldProvider: $PropertyType<typeof FormFieldContext, 'Provider'>,
  FormProvider: $PropertyType<typeof FormContext, 'Provider'>,
};

export type Form = Field & FormState & FormAPI & FormComponents;

export default function useForm(
  initialValue?: { [key: string]: any },
  onSubmit: Function,
  validator: any,
): Form {
  const [formState, setFormState] = useState({
    errors: {},
    submitting: false,
    valid: true,
    validating: false,
  });

  const field = useObjectField(undefined, initialValue, formState.errors, {
    debounceDelay: 0,
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (field.changing || formState.submitting || formState.validating) {
      return;
    }

    try {
      let values = field.value;

      if (validator) {
        setFormState(current => ({ ...current, validating: true }));

        values = await validator.validate(values, { abortEarly: false });

        setFormState(current => ({ ...current, errors: {}, valid: true, validating: false }));
      }

      setFormState(current => ({ ...current, submitting: true }));

      await onSubmit(values);

      setFormState(current => ({ ...current, submitting: false }));
    } catch (err) {
      const errors = {
        '': err.message,
      };
      const isYupError: boolean = yup.ValidationError.isError(err);

      setFormState(current => ({
        ...current,
        errors: isYupError ? convertValidationErrors(err) : errors,
        submitting: false,
        valid: !isYupError,
        validating: false,
      }));
    }
  }

  return {
    ...field,
    ...formState,
    handleSubmit,
    FieldProvider: field.Provider,
    FormProvider: FormContext.Provider,
  };
}
