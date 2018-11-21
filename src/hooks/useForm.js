// @flow

import * as yup from 'yup';
// $FlowFixMe
import { useCallback, useState } from 'react';
import convertValidationErrors from '../utils/convertValidationErrors';
import useObjectField, { type Field } from './useObjectField';
import { FormFieldContext, FormContext } from './formContext';

type HandleSubmitFn = (e: SyntheticEvent<HTMLFormElement>) => Promise<any>;

export type FormState = {
  errors: { [key: string]: string },
  submitting: boolean,
  valid: boolean,
  validating: boolean,
};

type FormAPI = {
  handleSubmit: HandleSubmitFn,
};

type FormComponents = {
  FieldProvider: $PropertyType<typeof FormFieldContext, 'Provider'>,
  FormProvider: $PropertyType<typeof FormContext, 'Provider'>,
};

export type Form = Field & FormState & FormAPI & FormComponents;

type ValidationFn = (values: any) => Promise<any | Error>;

export default function useForm(
  initialValue?: { [key: string]: any },
  onSubmit: Function,
  validator: any,
  validateOnChange?: boolean = false,
): Form {
  const [formState, setFormState] = useState({
    errors: {},
    submitting: false,
    valid: true,
    validating: false,
  });
  const processError = useCallback(
    (err, extraState) => {
      const errors = {
        '': err.message,
      };
      const isYupError: boolean = yup.ValidationError.isError(err);

      setFormState(current => ({
        ...current,
        errors: isYupError ? convertValidationErrors(err) : errors,
        valid: !isYupError,
        validating: false,
        ...extraState,
      }));
    },
    [setFormState],
  );
  const validate: ValidationFn = useCallback(
    async value => {
      if (!validator) {
        return value;
      }

      try {
        setFormState(current => ({ ...current, validating: true }));

        const values = await validator.validate(value, { abortEarly: false });

        setFormState(current => ({ ...current, valid: true, validating: false }));

        return values;
      } catch (e) {
        processError(e);

        throw e;
      }
    },
    [setFormState, processError, validator],
  );
  const onChange: ValidationFn = useCallback(
    async value => {
      if (!validateOnChange) {
        return value;
      }

      // catch the error because it is processed
      return validate(value).catch(() => {});
    },
    [validate, validateOnChange],
  );
  const field = useObjectField(undefined, initialValue, formState.errors, {
    debounceDelay: 0,
    onChange,
  });
  const handleSubmit: HandleSubmitFn = useCallback(
    async (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (field.changing || formState.submitting || formState.validating) {
        return;
      }

      try {
        // do not catch error using .catch but throw it so we can process it
        // and set form as not submitting
        const values = await validate(field.value);

        setFormState(current => ({ ...current, submitting: true }));

        await onSubmit(values);

        setFormState(current => ({ ...current, submitting: false }));
      } catch (err) {
        processError(err, { submitting: false });
      }
    },
    [
      onSubmit,
      setFormState,
      validate,
      field.changing,
      field.value,
      formState.submitting,
      formState.validating,
    ],
  );

  return {
    ...field,
    ...formState,
    handleSubmit,
    FieldProvider: field.Provider,
    FormProvider: FormContext.Provider,
  };
}
